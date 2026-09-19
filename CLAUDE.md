# The Becoming (hermes-sketchbook)

Hermes Agent Challenge submission. An AI agent starts with a blank style guide and develops
its own visual style over many iterations, with no human in the loop: each round it picks a
subject, generates an image, looks at its own output with native vision, critiques it against
a fixed rubric, then rewrites its own style guide. Live gallery:
https://the-becoming-elizabeth-emersons-projects.vercel.app

## Stack

Python 3, standard library only (no `requirements.txt`). Drives the Hermes Agent CLI as a
subprocess. Companion Next.js exhibition gallery lives in `web/` (own `package.json`, pnpm,
Tailwind 4; see `web/CLAUDE.md` for that app - not covered here since it is a separate
documented subproject).

## Prerequisites

- Hermes Agent installed and logged into Nous Portal (`hermes setup --portal`) so image
  generation and native vision are available; a multimodal model is required.
- `STYLE.md` must exist at repo root as the seed style guide; `sketchbook.py` reads it
  immediately on start and crashes if it is missing.

## Commands

```bash
python3 sketchbook.py     # self-improvement loop, runs many iterations
python3 finale.py         # transfer test + artist statement (run after sketchbook.py)
cd web && pnpm install && pnpm dev   # the exhibition gallery
```

## Env vars

All optional, read via `os.environ.get(...)` with defaults in both scripts:

- `HERMES_MODEL` - default `anthropic/claude-haiku-4.5`
- `HERMES_PROVIDER` - default `nous`
- `MAX_ITERS` - `sketchbook.py` only, default 80
- `CONVERGE_AT` - `sketchbook.py` only, stop after N near-identical style updates, default 3
- `CONVERGE_SIM` - `sketchbook.py` only, similarity threshold to count as "near-identical",
  default 0.92
- `ITER_TIMEOUT` - `sketchbook.py` only, per-iteration subprocess timeout in seconds,
  default 900

## How it works

`sketchbook.py`, each iteration: reads `STYLE.md`, has the agent choose a subject and generate
an image, has it critique its own output (composition, palette, motif, line/texture, mood),
then rewrites `STYLE.md` and snapshots it to `styles/iterNNN.md`. Stops when style similarity
between consecutive iterations stays >= `CONVERGE_SIM` for `CONVERGE_AT` iterations in a row,
or at `MAX_ITERS`. Appends each iteration's subject + critique + similarity to `critiques.md`.

`finale.py` runs after: a transfer test (applies the learned style to subjects deliberately far
from what the agent chose for itself, to prove the style is internalized and portable, not just
subject-narrowing) logged to `transfer.md`, then has the agent write its own artist statement
and title the collection, saved to `artist_statement.md`.

## Layout

- `sketchbook.py`, `finale.py` - the two scripts above
- `STYLE.md` - the living/final style guide
- `styles/iterNNN.md` - style guide snapshot after each iteration (diff across these shows the
  evolution)
- `gallery/iterNNN.png` - each iteration's generated image
- `critiques.md`, `transfer.md`, `artist_statement.md` - logs and finale output
- `web/` - Next.js gallery rendering the whole arc (own CLAUDE.md/AGENTS.md)

## Gotchas

- `sketchbook.py` invokes `hermes` via `subprocess.run` with `--yolo`; it expects the agent's
  stdout to contain exactly four tags (`<SUBJECT>`, `<IMG>`, `<CRITIQUE>`, `<STYLE>`). If a
  run emits neither an image URL nor a new style, the raw output is saved to
  `.raw_iterNNN.txt` for debugging (gitignored).
- Iteration failures (timeout or exception) are caught and logged; the loop continues to the
  next iteration rather than aborting the whole run.
