"""Fidelity tests for the ByteFight replay converter.

Two layers:
  1. Shape tests — the emitted match must satisfy CONTRACT.md exactly, checked
     against the hand-written fixture the player was built against.
  2. Corpus fidelity — every real replay log in the bytefight repo is converted
     and the reconstructed paint grid is compared cell-for-cell against the
     engine's own p1_territory / p2_territory counts on every single turn.

Run:  python test_convert.py [--logs <bytefight logs dir>]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from convert import ConversionError, convert, load_source

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[1]
# Test-only asset. It deliberately does NOT live under public/ — it is not a real
# match and must never be served or appear in the match picker.
FIXTURE = HERE / "_fixture.json"
DEFAULT_LOGS = Path(r"C:\Users\prana\projects\bytefight\logs")


class Failure(Exception):
    pass


def check(cond: bool, msg: str) -> None:
    if not cond:
        raise Failure(msg)


def test_fixture_shape() -> None:
    """The fixture is the contract made concrete; validate our shape checker on it."""
    with FIXTURE.open(encoding="utf-8") as fh:
        match = json.load(fh)
    validate_shape(match, label="_fixture")


def validate_shape(match: dict, *, label: str) -> None:
    check(set(match) == {"meta", "static", "frames"}, f"{label}: top-level keys")
    meta, static, frames = match["meta"], match["static"], match["frames"]

    for key in ("id", "width", "height", "p1", "p2", "result", "reason", "turns"):
        check(key in meta, f"{label}: meta.{key} missing")
    w, h = meta["width"], meta["height"]
    check(meta["result"] in ("P1", "P2", "DRAW"), f"{label}: bad result {meta['result']!r}")
    for side in ("p1", "p2"):
        check(isinstance(meta[side]["name"], str), f"{label}: meta.{side}.name")
        check(len(meta[side]["start"]) == 2, f"{label}: meta.{side}.start")

    check(len(static["walls"]) == h, f"{label}: walls height")
    check(all(len(r) == w for r in static["walls"]), f"{label}: walls width")
    check(all(v in (0, 1) for r in static["walls"] for v in r), f"{label}: walls values")
    check(len(static["hills"]) == h, f"{label}: hills height")
    check(all(len(r) == w for r in static["hills"]), f"{label}: hills width")

    hill_ids = {str(v) for r in static["hills"] for v in r if v}
    check(len(frames) > 0, f"{label}: no frames")

    for i, f in enumerate(frames):
        check(f["t"] == i, f"{label}: frame {i} has t={f['t']}")
        check(f["turnOf"] in (-1, 0, 1), f"{label}: frame {i} turnOf={f['turnOf']}")
        check(len(f["paint"]) == w * h, f"{label}: frame {i} paint length")
        check(all(-4 <= v <= 4 for v in f["paint"]), f"{label}: frame {i} paint magnitude")
        for side in ("p1", "p2"):
            p = f[side]
            check(len(p["loc"]) == 2, f"{label}: frame {i} {side}.loc")
            check(0 <= p["loc"][0] < h and 0 <= p["loc"][1] < w, f"{label}: frame {i} {side} off-board")
            check(p["territory"] >= 0, f"{label}: frame {i} {side}.territory")
        for b in f["beacons"]:
            check(len(b) == 3 and b[2] in (0, 1), f"{label}: frame {i} beacon {b}")
            check(0 <= b[0] < h and 0 <= b[1] < w, f"{label}: frame {i} beacon off-board")
        for p in f["powerups"]:
            check(len(p) == 2, f"{label}: frame {i} powerup {p}")
            check(0 <= p[0] < h and 0 <= p[1] < w, f"{label}: frame {i} powerup off-board")
        check(set(f["hills"]) == hill_ids, f"{label}: frame {i} hill ids {set(f['hills'])} != {hill_ids}")
        check(all(v in (-1, 0, 1) for v in f["hills"].values()), f"{label}: frame {i} hill owners")
        check(isinstance(f["action"], str), f"{label}: frame {i} action")

        # Sign counts must equal the reported territory — the core fidelity claim.
        check(
            sum(1 for v in f["paint"] if v > 0) == f["p1"]["territory"],
            f"{label}: frame {i} P1 paint cells != territory",
        )
        check(
            sum(1 for v in f["paint"] if v < 0) == f["p2"]["territory"],
            f"{label}: frame {i} P2 paint cells != territory",
        )


def test_corpus(logs_dir: Path) -> tuple[int, int, list[str]]:
    """Convert every real replay log; the territory assertion is the fidelity test."""
    files = sorted(
        p for p in logs_dir.rglob("*.json")
        if p.name not in ("analysis_report.json",)
    )
    passed = 0
    skipped = 0
    failures: list[str] = []

    for path in files:
        try:
            src = load_source(path)
        except (ConversionError, json.JSONDecodeError, UnicodeDecodeError):
            skipped += 1  # not a replay log (scrimmage listings, snapshots, ...)
            continue
        try:
            match = convert(src, match_id=path.stem, p1_name="P1", p2_name="P2")
            validate_shape(match, label=path.name)
            passed += 1
        except (Failure, ConversionError) as exc:
            failures.append(str(exc))

    return passed, skipped, failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--logs", default=str(DEFAULT_LOGS))
    args = parser.parse_args()

    print("shape: fixture ...", end=" ")
    try:
        test_fixture_shape()
    except Failure as exc:
        print(f"FAIL\n  {exc}")
        return 1
    print("ok")

    logs_dir = Path(args.logs)
    if not logs_dir.is_dir():
        print(f"corpus: skipped (no logs dir at {logs_dir})")
        return 0

    print(f"corpus: converting every replay under {logs_dir} ...")
    passed, skipped, failures = test_corpus(logs_dir)
    print(f"  {passed} replays converted with exact territory fidelity")
    print(f"  {skipped} non-replay files skipped")
    if failures:
        print(f"  {len(failures)} FAILURES:")
        for msg in failures[:20]:
            print(f"    - {msg}")
        if len(failures) > 20:
            print(f"    ... and {len(failures) - 20} more")
        return 1
    print("all good")
    return 0


if __name__ == "__main__":
    sys.exit(main())
