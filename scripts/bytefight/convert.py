"""ByteFight replay converter.

Reads raw engine replay logs from the bytefight repo and emits the render-ready
JSON described in CONTRACT.md, so the React player needs no game logic.

Usage:
    python convert.py --manifest matches.json
    python convert.py --source "<path to match.json>" --id demo --mine p1 \
        --p1 "Paint (my bot)" --p2 "Sample Controller"

Source format (per-turn parallel arrays) is documented in CONTRACT.md.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = REPO_ROOT / "public" / "bytefight"

REQUIRED_KEYS = (
    "p1_loc", "p2_loc", "p1_stamina", "p2_stamina",
    "p1_max_stamina", "p2_max_stamina", "p1_territory", "p2_territory",
    "parity_playing", "paint_updates", "beacon_updates", "powerup_updates",
    "hill_updates", "hill_mapping", "walls", "actions", "map_string",
)

# parity_playing in the source is 1 = P1, -1 = P2, 0 = nobody (opening frame).
# The contract exposes turnOf as 0 = P1, 1 = P2, -1 = nobody.
_PARITY_TO_TURN_OF = {1: 0, -1: 1, 0: -1}


class ConversionError(Exception):
    pass


def load_source(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as fh:
        data = json.load(fh)
    if not isinstance(data, dict):
        raise ConversionError(f"{path.name}: expected a JSON object")
    missing = [k for k in REQUIRED_KEYS if k not in data]
    if missing:
        raise ConversionError(f"{path.name}: missing keys {', '.join(missing)}")
    return data


def _dims(src: dict[str, Any]) -> tuple[int, int]:
    walls = src["walls"]
    height = len(walls)
    width = len(walls[0]) if height else 0
    if any(len(row) != width for row in walls):
        raise ConversionError("walls is ragged")
    return width, height


def _starts(src: dict[str, Any]) -> tuple[list[int], list[int]]:
    """Starting [row, col] for each player, from map_string with a loc fallback."""
    parts = str(src.get("map_string", "")).split("#")
    if len(parts) >= 3:
        try:
            p1 = [int(x) for x in parts[1].split(",")]
            p2 = [int(x) for x in parts[2].split(",")]
            if len(p1) == 2 and len(p2) == 2:
                return p1, p2
        except ValueError:
            pass
    return list(src["p1_loc"][0]), list(src["p2_loc"][0])


def _result(src: dict[str, Any]) -> str:
    raw = str(src.get("result", "")).upper()
    if raw in ("PLAYER_1", "P1"):
        return "P1"
    if raw in ("PLAYER_2", "P2"):
        return "P2"
    return "DRAW"


def _describe_action(entries: Any) -> str:
    """Short human label for the mover's actions this turn."""
    if not isinstance(entries, list):
        return ""
    paints: list[list[int]] = []
    moves: list[str] = []
    beacons = 0
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        name = entry.get("name")
        if name == "Paint":
            loc = entry.get("location")
            if isinstance(loc, list) and len(loc) == 2:
                paints.append(loc)
        elif name == "Move":
            direction = entry.get("direction", "?")
            move_type = entry.get("move_type", "REGULAR")
            moves.append(direction if move_type == "REGULAR" else f"{direction} ({move_type})")
            if entry.get("place_beacon"):
                beacons += 1

    bits: list[str] = []
    if paints:
        r, c = paints[0]
        bits.append(f"Paint({r},{c}) x{len(paints)}" if len(paints) > 1 else f"Paint({r},{c})")
    for direction in moves:
        bits.append(f"Move {direction}")
    if beacons:
        bits.append(f"Beacon x{beacons}" if beacons > 1 else "Beacon")
    return " · ".join(bits)


def _apply_updates(state: dict[int, int], updates: Any, *, drop_zero: bool) -> None:
    """Fold one turn's cumulative deltas into a running cell -> value map."""
    if not isinstance(updates, dict):
        return
    for key, value in updates.items():
        idx = int(key)
        if drop_zero and not value:
            state.pop(idx, None)
        else:
            state[idx] = value


def convert(
    src: dict[str, Any],
    *,
    match_id: str,
    p1_name: str,
    p2_name: str,
) -> dict[str, Any]:
    width, height = _dims(src)
    cells = width * height
    n = len(src["parity_playing"])

    lengths = {
        key: len(src[key])
        for key in (
            "p1_loc", "p2_loc", "p1_stamina", "p2_stamina", "p1_max_stamina",
            "p2_max_stamina", "p1_territory", "p2_territory", "parity_playing",
            "paint_updates", "beacon_updates", "powerup_updates", "hill_updates",
            "actions",
        )
    }
    if len(set(lengths.values())) != 1:
        raise ConversionError(f"per-turn arrays disagree in length: {lengths}")

    hill_mapping = src["hill_mapping"]
    hill_ids = sorted({hid for row in hill_mapping for hid in row if hid})

    paint: dict[int, int] = {}
    beacons: dict[int, int] = {}
    powerups: dict[int, bool] = {}
    hills: dict[str, int] = {str(hid): -1 for hid in hill_ids}

    frames: list[dict[str, Any]] = []
    for t in range(n):
        _apply_updates(paint, src["paint_updates"][t], drop_zero=True)
        _apply_updates(beacons, src["beacon_updates"][t], drop_zero=True)
        _apply_updates(powerups, src["powerup_updates"][t], drop_zero=False)
        for hid, owner in (src["hill_updates"][t] or {}).items():
            hills[str(int(hid))] = int(owner)

        flat = [0] * cells
        for idx, value in paint.items():
            if 0 <= idx < cells:
                flat[idx] = value

        # Fidelity check: the grid we reconstructed must match the engine's counts.
        p1_count = sum(1 for v in paint.values() if v > 0)
        p2_count = sum(1 for v in paint.values() if v < 0)
        expected_p1 = src["p1_territory"][t]
        expected_p2 = src["p2_territory"][t]
        if (p1_count, p2_count) != (expected_p1, expected_p2):
            raise ConversionError(
                f"{match_id}: territory mismatch at t={t}: "
                f"reconstructed {p1_count}/{p2_count}, log says {expected_p1}/{expected_p2}"
            )

        parity = src["parity_playing"][t]
        frames.append({
            "t": t,
            "turnOf": _PARITY_TO_TURN_OF.get(parity, -1),
            "p1": {
                "loc": list(src["p1_loc"][t]),
                "stamina": src["p1_stamina"][t],
                "maxStamina": src["p1_max_stamina"][t],
                "territory": expected_p1,
            },
            "p2": {
                "loc": list(src["p2_loc"][t]),
                "stamina": src["p2_stamina"][t],
                "maxStamina": src["p2_max_stamina"][t],
                "territory": expected_p2,
            },
            "paint": flat,
            "beacons": [
                [idx // width, idx % width, 0 if owner > 0 else 1]
                for idx, owner in sorted(beacons.items())
            ],
            "powerups": [
                [idx // width, idx % width]
                for idx, present in sorted(powerups.items()) if present
            ],
            "hills": dict(hills),
            "action": _describe_action(src["actions"][t]),
        })

    p1_start, p2_start = _starts(src)
    return {
        "meta": {
            "id": match_id,
            "width": width,
            "height": height,
            "p1": {"name": p1_name, "start": p1_start},
            "p2": {"name": p2_name, "start": p2_start},
            "result": _result(src),
            "reason": src.get("reason", ""),
            "turns": int(src.get("turn_count", max(n - 1, 0))),
        },
        "static": {
            "walls": [[1 if cell else 0 for cell in row] for row in src["walls"]],
            "hills": [[int(cell) for cell in row] for row in hill_mapping],
        },
        "frames": frames,
    }


def index_entry(match: dict[str, Any], *, map_name: str = "") -> dict[str, Any]:
    meta = match["meta"]
    return {
        "id": meta["id"],
        "file": f"matches/{meta['id']}.json",
        "p1": meta["p1"]["name"],
        "p2": meta["p2"]["name"],
        "map": map_name or f"{meta['width']}x{meta['height']}",
        "width": meta["width"],
        "height": meta["height"],
        "turns": meta["turns"],
        "result": meta["result"],
        "reason": meta["reason"],
    }


def _resolve(path_str: str, manifest_dir: Path) -> Path:
    path = Path(path_str)
    return path if path.is_absolute() else (manifest_dir / path).resolve()


def run(entries: list[dict[str, Any]], manifest_dir: Path, out_dir: Path) -> list[dict[str, Any]]:
    (out_dir / "matches").mkdir(parents=True, exist_ok=True)
    index: list[dict[str, Any]] = []

    for entry in entries:
        source_path = _resolve(entry["source"], manifest_dir)
        match_id = entry.get("id") or source_path.stem
        src = load_source(source_path)

        # `mine` says which engine slot our bot occupied; it only affects labels.
        mine = entry.get("mine", "p1")
        if mine not in ("p1", "p2"):
            raise ConversionError(f"{match_id}: 'mine' must be 'p1' or 'p2', got {mine!r}")
        default_mine = entry.get("botName", "Paint (my bot)")
        default_opp = entry.get("opponent") or source_path.stem
        p1_name = entry.get("p1") or (default_mine if mine == "p1" else default_opp)
        p2_name = entry.get("p2") or (default_opp if mine == "p1" else default_mine)

        match = convert(src, match_id=match_id, p1_name=p1_name, p2_name=p2_name)
        out_path = out_dir / "matches" / f"{match_id}.json"
        with out_path.open("w", encoding="utf-8") as fh:
            json.dump(match, fh, separators=(",", ":"))

        row = index_entry(match, map_name=entry.get("map", ""))
        row["mine"] = mine
        index.append(row)
        size_kb = out_path.stat().st_size / 1024
        print(
            f"  {match_id}: {match['meta']['width']}x{match['meta']['height']}, "
            f"{len(match['frames'])} frames, {match['meta']['result']}/{match['meta']['reason']} "
            f"-> {size_kb:.0f} KB"
        )

    return index


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", help="JSON file listing matches to convert")
    parser.add_argument("--source", help="single source replay log to convert")
    parser.add_argument("--id", help="match id for --source")
    parser.add_argument("--mine", default="p1", choices=("p1", "p2"))
    parser.add_argument("--p1", help="display name for player 1")
    parser.add_argument("--p2", help="display name for player 2")
    parser.add_argument("--out", default=str(OUT_DIR), help="output directory")
    args = parser.parse_args(argv)

    if bool(args.manifest) == bool(args.source):
        parser.error("pass exactly one of --manifest or --source")

    if args.manifest:
        manifest_path = Path(args.manifest).resolve()
        with manifest_path.open(encoding="utf-8") as fh:
            manifest = json.load(fh)
        entries = manifest["matches"]
        manifest_dir = manifest_path.parent
    else:
        entries = [{
            "source": args.source,
            "id": args.id,
            "mine": args.mine,
            "p1": args.p1,
            "p2": args.p2,
        }]
        manifest_dir = Path.cwd()

    out_dir = Path(args.out).resolve()
    try:
        index = run(entries, manifest_dir, out_dir)
    except ConversionError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    with (out_dir / "index.json").open("w", encoding="utf-8") as fh:
        json.dump({"matches": index}, fh, indent=2)
    print(f"wrote {len(index)} match(es) to {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
