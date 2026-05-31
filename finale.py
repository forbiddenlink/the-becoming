#!/usr/bin/env python3
"""Finale for the Sketchbook project. Run AFTER sketchbook.py finishes.

Two acts that turn "it narrowed its subjects" into "it internalized a portable style":

  Act 1 — TRANSFER TEST: hand the agent subjects far outside the bleak world it
          chose for itself, and make it render them in ITS OWN established style.
          If a birthday cake comes out in its brutalist-chiaroscuro hand, the
          style is real and portable, not just subject-narrowing.

  Act 2 — ARTIST STATEMENT: the agent writes a manifesto about its own style and
          titles the body of work. Optionally narrated via TTS.

Artifacts:
  gallery/transferNN.png        transfer-test images
  transfer.md                   subject + how-it-applied-its-style, per piece
  artist_statement.md           the manifesto + collection title
"""
import subprocess, os, re, urllib.request, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent
GALLERY = ROOT / "gallery"; GALLERY.mkdir(exist_ok=True)
STYLE = ROOT / "STYLE.md"
TRANSFER_LOG = ROOT / "transfer.md"
STATEMENT = ROOT / "artist_statement.md"

MODEL = os.environ.get("HERMES_MODEL", "anthropic/claude-haiku-4.5")
PROVIDER = os.environ.get("HERMES_PROVIDER", "nous")

# Deliberately cheerful / mundane — the opposite of what it chose for itself.
TRANSFER_SUBJECTS = [
    "a child's brightly-decorated birthday cake with lit candles",
    "a golden retriever puppy playing in a sunny meadow",
    "a cherry-red convertible sports car on a coastal road",
    "a bowl of fresh summer fruit on a kitchen table",
]

TRANSFER_PROMPT = """You are an established artist with a fully-formed signature style. This is your style guide — your voice:
---
{style}
---
Now render a subject you would NEVER normally choose: {subject}.
Do NOT abandon your style to suit the subject. Force the subject THROUGH your established visual language — your palette, composition rules, motifs, line/texture, and mood. Make it unmistakably YOUR work.

1. Use image_generate to create it in your signature style.
2. Use your vision capability to look at the result and judge, in 1-2 sentences, whether your style survived contact with an alien subject.

Output EXACTLY:
<IMG>the exact image URL</IMG>
<NOTE>1-2 sentences: did your style hold? what stayed unmistakably yours?</NOTE>
"""

STATEMENT_PROMPT = """This is the style guide you wrote for yourself across many iterations of self-directed work:
---
{style}
---
You have now also applied this style to subjects far outside your usual world, and it held.

Write a short ARTIST STATEMENT (120-180 words) in first person about the visual voice you developed: what you are drawn to, what your style means, what you learned about your own taste by making and judging your own work. Then give your collected body of work a TITLE.

Output EXACTLY:
<TITLE>the title of your collection</TITLE>
<STATEMENT>your artist statement</STATEMENT>
"""


def extract(tag, text):
    m = re.search(rf"<{tag}>(.*?)</{tag}>", text, re.S)
    return m.group(1).strip() if m else None


def hermes(prompt, timeout=900):
    return subprocess.run(
        ["hermes", "-z", prompt, "-m", MODEL, "--provider", PROVIDER, "--yolo"],
        capture_output=True, text=True, timeout=timeout,
    ).stdout


def transfer():
    style = STYLE.read_text()
    with open(TRANSFER_LOG, "w") as f:
        f.write("# Transfer Test — the style applied to alien subjects\n\n")
    for i, subj in enumerate(TRANSFER_SUBJECTS, 1):
        out = hermes(TRANSFER_PROMPT.format(style=style, subject=subj))
        url, note = extract("IMG", out), extract("NOTE", out)
        ok = False
        if url:
            try:
                urllib.request.urlretrieve(url, GALLERY / f"transfer{i:02d}.png"); ok = True
            except Exception as e:
                print(f"  transfer {i} download failed: {e}")
        with open(TRANSFER_LOG, "a") as f:
            f.write(f"## transfer {i:02d}: {subj}\n- held: {note}\n\n")
        print(f"transfer {i:02d}: {subj!r} img={ok}")


def statement():
    out = hermes(STATEMENT_PROMPT.format(style=STYLE.read_text()))
    title, body = extract("TITLE", out), extract("STATEMENT", out)
    STATEMENT.write_text(
        f"# {title or 'Untitled Collection'}\n\n_Artist statement, "
        f"{datetime.date(2026, 5, 29).isoformat()}_\n\n{body or out.strip()}\n"
    )
    print(f"statement written. title={title!r}")


if __name__ == "__main__":
    print("Finale — Act 1: transfer test")
    transfer()
    print("Finale — Act 2: artist statement")
    statement()
    print("done.")
