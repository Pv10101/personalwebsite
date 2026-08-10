# ByteFight Replay — Data Contract (v1)

Shared spec between the **converter** (`scripts/bytefight/`, Python) and the
**replay player** (`src/components/bytefight/`, React). Both sides build against
THIS document. Do not change the shapes without updating both sides.

## Output files (converter → `public/bytefight/`)

- `public/bytefight/index.json` — list of available matches (see below).
- `public/bytefight/matches/<matchId>.json` — one converted match (see below).

### `index.json`
```json
{
  "matches": [
    {
      "id": "5f2f5c13",
      "file": "matches/5f2f5c13.json",
      "p1": "Paint (my bot)",
      "p2": "Sample Controller",
      "map": "the_temple",
      "width": 27, "height": 27,
      "turns": 288,
      "result": "P1",          // "P1" | "P2" | "DRAW"
      "reason": "DOMINATION"
    }
  ]
}
```

### `matches/<id>.json`
Render-ready. The player needs NO game logic — every frame is a full snapshot.
```json
{
  "meta": {
    "id": "5f2f5c13",
    "width": 27, "height": 27,
    "p1": { "name": "Paint (my bot)", "start": [4, 13] },   // [row, col]
    "p2": { "name": "Sample Controller", "start": [22, 13] },
    "result": "P1", "reason": "DOMINATION", "turns": 288
  },
  "static": {
    "walls": [ [0,1,1,...], ... ],   // height rows x width cols; 1 = wall, 0 = open
    "hills": [ [0,0,1,...], ... ]    // height x width; hillId (0 = none, 1..N = hill id)
  },
  "frames": [
    {
      "t": 0,                        // frame index (0-based)
      "turnOf": 0,                   // 0 = P1 moved, 1 = P2 moved, -1 = nobody (opening frame)
      "p1": { "loc": [4,13], "stamina": 100, "maxStamina": 100, "territory": 0 },
      "p2": { "loc": [22,13], "stamina": 100, "maxStamina": 100, "territory": 0 },
      "paint": [ -1, 0, 1, 2, -2, ... ],   // FLAT length width*height, row-major.
                                           //   0 = neutral/unpainted
                                           //   +k = P1 paint, k layers (1..4)
                                           //   -k = P2 paint, k layers (1..4)
      "beacons": [ [10,5,0], [3,7,1] ],    // [row, col, owner] owner 0=P1 1=P2
      "powerups": [ [8,2], [4,9] ],        // [row, col]
      "hills": { "1": -1, "2": 0, "3": 1 },// hillId -> owner (-1 none, 0 P1, 1 P2)
      "action": "Paint(4,12) +3 · Move DOWN"  // short human label of P's move this turn ("" if none)
    }
  ]
}
```

Notes:
- `paint` uses `0` for neutral in the flat array (NOT -1). Positive=P1, negative=P2,
  magnitude = layers. (Source logs encode neutral as literal 0.)
- `turnOf` is `-1` on frame 0, before either player has moved. The player must render
  that frame without a "to move" highlight. (Source `parity_playing` is `1`=P1,
  `-1`=P2, `0`=nobody; the converter remaps it to `0`/`1`/`-1`.)
- `beacons` owner is `0`=P1 / `1`=P2, remapped from the source's sign convention
  (`+1`=P1, `-1`=P2, `0`=removed) to match the `p1`/`p2` indexing used elsewhere.
- Territory count per player each frame == number of cells with that player's sign.
  The converter asserts this against the source `p1_territory` / `p2_territory`.
- Frame count == length of source per-turn arrays.

## Source replay format (for the converter only)

Per-match JSON in the bytefight repo (`logs/New logs/match-*.json`,
`logs/Past logs/misc/all_matches_combined.json`). Per-turn arrays (all same length):
- `p1_loc`,`p2_loc`: `[r,c]`. `p{1,2}_stamina`,`_max_stamina`,`_territory`, `_time_left`.
- `parity_playing`: 0/1 whose move.
- `paint_updates[t]`: `{ "cellIdx": value }` cumulative deltas; value sign=owner
  (+P1,-P2), magnitude=layers, 0=erased. cellIdx = r*width + c.
- `beacon_updates[t]`: `{ "cellIdx": owner }` (sign convention as paint; treat 0/removal as gone).
- `powerup_updates[t]`: `{ "cellIdx": true|false }` present/consumed.
- `hill_updates[t]`: `{ "hillId": owner }` owner -1 none / 0 P1 / 1 P2.
- `actions[t]`: `"NONE"` or list of `{"name":"Move"|"Paint", ...}` dicts (the mover's actions).
- Static: `walls` (H x W bool), `hill_mapping` (H x W int hill id).
- `map_string`: `"W,H#p1r,p1c#p2r,p2c#wallbitmap"`.
- Outcome: `result` (`PLAYER_1`/`PLAYER_2`/tie), `reason`, `turn_count`.

The converter reconstructs each frame's full grid by applying updates cumulatively
from t=0..t, then emits the render-ready snapshot above.
