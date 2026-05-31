#!/usr/bin/env python3
"""Hermes Sketchbook — an agent that develops its OWN visual style.

Each iteration the agent: chooses a subject, renders it in its current evolving
style, LOOKS at its own output (native vision), critiques it against a fixed
rubric, then refines its style guide. It stops when the style stabilizes
(converged) or MAX_ITERS is reached.

Artifacts (the proof):
  gallery/iterNNN.png   the image that iteration
  styles/iterNNN.md     snapshot of the style guide after that iteration
  STYLE.md              the living style guide (latest)
  critiques.md          per-iteration subject + self-critique + style drift
"""
import subprocess, os, re, sys, time, json, pathlib, datetime, difflib, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
GALLERY = ROOT / "gallery"; GALLERY.mkdir(exist_ok=True)
STYLES = ROOT / "styles"; STYLES.mkdir(exist_ok=True)
STYLE = ROOT / "STYLE.md"
LOG = ROOT / "critiques.md"

MODEL = os.environ.get("HERMES_MODEL", "anthropic/claude-haiku-4.5")
PROVIDER = os.environ.get("HERMES_PROVIDER", "nous")
MAX_ITERS = int(os.environ.get("MAX_ITERS", "80"))
CONVERGE_AT = int(os.environ.get("CONVERGE_AT", "3"))   # stop after N near-identical style updates
CONVERGE_SIM = float(os.environ.get("CONVERGE_SIM", "0.92"))
ITER_TIMEOUT = int(os.environ.get("ITER_TIMEOUT", "900"))

PROMPT = """You are an artist with one mission: develop YOUR OWN distinctive, recognizable visual style across many iterations, then apply it consistently to any subject.

Your current style guide (honor it, and refine it):
---
{style}
---

This iteration:
1. CHOOSE a subject to paint. Vary your subjects across iterations on purpose — your STYLE, not your subject, is what must stay consistent and become recognizable.
2. Use image_generate to render that subject in YOUR current evolving style. Translate your style guide into a vivid, specific image prompt.
3. Use your vision capability to LOOK at the image you just generated and critique it honestly against this rubric: composition, color palette, recurring motifs/symbols, line/texture/mood.
4. Refine your style guide so your visual identity becomes MORE distinctive and coherent: keep what works, sharpen what does not. Give your current style/era a NAME.

Output EXACTLY these four blocks and nothing else:
<SUBJECT>what you chose to paint</SUBJECT>
<IMG>the exact image URL you generated</IMG>
<CRITIQUE>1-2 sentence honest self-critique referencing the rubric</CRITIQUE>
<STYLE>the full updated style guide in markdown: a NAME for your current era, palette, composition rules, recurring motifs, line/texture, mood</STYLE>
"""


def extract(tag, text):
    m = re.search(rf"<{tag}>(.*?)</{tag}>", text, re.S)
    return m.group(1).strip() if m else None


def similar(a, b):
    return difflib.SequenceMatcher(None, a or "", b or "").ratio()


def run_iter(i):
    style = STYLE.read_text()
    proc = subprocess.run(
        ["hermes", "-z", PROMPT.format(style=style), "-m", MODEL,
         "--provider", PROVIDER, "--yolo"],
        capture_output=True, text=True, timeout=ITER_TIMEOUT,
    )
    out = proc.stdout
    subject = extract("SUBJECT", out)
    url = extract("IMG", out)
    crit = extract("CRITIQUE", out)
    new_style = extract("STYLE", out)

    ok_img = False
    if url:
        try:
            urllib.request.urlretrieve(url, GALLERY / f"iter{i:03d}.png")
            ok_img = True
        except Exception as e:
            print(f"  image download failed: {e}")

    sim = 1.0
    if new_style:
        sim = similar(style, new_style)
        (STYLES / f"iter{i:03d}.md").write_text(new_style + "\n")
        STYLE.write_text(new_style + "\n")

    with open(LOG, "a") as f:
        ts = datetime.datetime.now().isoformat(timespec="seconds")
        f.write(f"## iter {i:03d} — {ts}\n")
        f.write(f"- subject: {subject}\n")
        f.write(f"- critique: {crit}\n")
        f.write(f"- style_similarity_to_prev: {sim:.2f}\n\n")

    if not (url or new_style):
        # Save raw output for debugging when the agent didn't emit tags.
        (ROOT / f".raw_iter{i:03d}.txt").write_text(out)
    print(f"iter {i:03d}: subject={subject!r} img={ok_img} style_sim={sim:.2f}")
    return sim


def main():
    print(f"Sketchbook start: model={MODEL} provider={PROVIDER} max={MAX_ITERS} "
          f"converge={CONVERGE_AT}@{CONVERGE_SIM}")
    stable = 0
    for i in range(1, MAX_ITERS + 1):
        try:
            sim = run_iter(i)
            stable = stable + 1 if sim >= CONVERGE_SIM else 0
            if stable >= CONVERGE_AT:
                print(f"Style converged after {i} iterations "
                      f"(stable {CONVERGE_AT}x at sim>={CONVERGE_SIM}). It found its voice.")
                break
        except subprocess.TimeoutExpired:
            print(f"iter {i:03d}: timed out after {ITER_TIMEOUT}s, continuing")
        except Exception as e:
            print(f"iter {i:03d} error: {e}")
        time.sleep(2)
    print("done.")


if __name__ == "__main__":
    main()
