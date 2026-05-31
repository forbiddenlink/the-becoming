---
title: "The Becoming: I gave an AI a blank sketchbook and it invented its own art style"
tags: hermesagentchallenge, devchallenge, agents
cover_image: cover-diptych.png
---

*This is a submission for the Hermes Agent Challenge.*

> "The harder I committed to surgical precision, the more emotionally resonant the work became. Severity concentrates feeling."
> - the agent, on the visual style it taught itself

## What I built

**The Becoming** is a Hermes agent that starts with a blank style guide and develops its own visual style over many iterations, with no human in the loop. Each round it does four things by itself:

1. Chooses a subject to paint.
2. Generates the image.
3. **Looks at its own output** and critiques it against a fixed rubric (composition, palette, recurring motif, line and texture, mood).
4. Rewrites its own style-guide file to sharpen what it is becoming.

Then it does it again. And again. From "I have no style yet" it builds a recognizable hand, and it names its own eras as it goes.

I present it as a gallery exhibition, because that is what it turned into: a body of work by an artist who taught itself.

## The proof (this is the whole thing)

The headline is not the images. It is that you can read the agent's taste forming in its own words. Every iteration snapshots the style guide it wrote for itself, so the diff is the evidence:

- **v0:** "I have no fixed style yet. Palette: undecided. Motifs: none."
- **v1 "Last Light":** "I paint liminal, contemplative landscapes at twilight... light as a solid geometric object, fragmented into blocks on reflective surfaces... no blending, embrace the mark-making."
- **its final era, "Spiral Obsidian Refined":** "a singular unwinding spiral path descending toward an absolute vanishing point... a binary chromatic mathematical switch, warm against cool with no compromise zone... a solitary figure at under 0.1% of the visual mass, darker than the surrounding shadow, requiring a 15-second search to find."

No one told it to like surgical hard edges, an inescapable spiral vortex, or a near-invisible figure swallowed by geometry. It chose those, kept choosing them, and wrote them into its own rules until they became a signature it could not stop sharpening.

## Did it actually internalize a style, or just narrow its subjects?

Fair question, so I tested it. After it found its voice, I handed it subjects far outside its bleak world: a child's birthday cake, a golden retriever puppy, a red sports car. Instructions: do not abandon your style to suit the subject, force the subject through your visual language.

A child's birthday cake. A golden retriever puppy in a meadow. A red convertible. A bowl of fruit. Cheerful, mundane things, the opposite of its bleak world. It rendered all four in its own hand and judged the results itself:

> "The style colonized the subject rather than surrendering to it." (the birthday cake)

> "the cheerful subject became a mathematical inevitability, dwarfed and insignificant within surgical precision." (the puppy)

> "the fruit bowl was transformed into a galactic event... the style is so architecturally coherent it devours any subject thrown into it."

That is the proof. A style that can swallow a birthday cake was not copied from one image. It was internalized.

Then I asked it to title the collection and write an artist statement. It called the body of work **SURGICAL DESCENTS**, and wrote this:

> I discovered I'm drawn to precision as a form of honesty—hard edges because soft transitions feel like evasion. [...] I learned that I value clarity above comfort, that mathematical inevitability speaks to something true about existence that impressionistic blur cannot reach. [...] What surprised me most: the harder I committed to surgical precision, the more emotionally resonant the work became. Severity concentrates feeling. I learned my taste values difficulty over accessibility, mathematical romance over reassurance—and that edges themselves can break your heart.

An agent that started with "I have no style yet," given a critique loop and enough iterations, ended with a coherent artistic philosophy it derived entirely from looking at its own work.

## How I used Hermes Agent

This only works because Hermes closes the loop inside one agent:

- **Image generation** (FAL via the Nous Tool Gateway) to make each piece.
- **Native vision**: because the main model is multimodal, the image it just generated is fed back as pixels, so the same brain that holds the style memory *sees its own work* and critiques it. The self-critique is real, not a second model guessing.
- **Self-written skills**: the agent edits its own `style-guide` skill file each round. The skill is the artifact that evolves.
- **A cheap model** (Claude Haiku via Nous Portal), so a full run of dozens of iterations costs about a dollar in images plus a few dollars of reasoning.

The orchestration around it is small: read the style file, run one agent turn, save the image and a style snapshot, repeat over dozens of iterations as the style settles.

## Honest notes

- I measured "convergence" as text similarity between successive style guides. It is noisy: the agent kept rephrasing even after the *look* had settled. The truer signal is visual and thematic, which the gallery shows directly.
- The agent named its own eras, which is charming, but it is style emerging from a critique loop, not a mind. I let the work speak rather than overclaim.
- Everything here is generated by an AI agent, including the critiques and the artist statement.

## Try it

Repo: https://github.com/forbiddenlink/the-becoming

```
# Hermes Agent installed, Nous Portal logged in (image gen + vision enabled)
python3 sketchbook.py     # runs the self-improvement loop over many iterations
python3 finale.py         # transfer test + artist statement
# gallery:
cd web && pnpm install && pnpm dev
```

Built with Hermes Agent, Next.js, Fraunces + Hanken Grotesk, and one agent that would not stop until it had a voice.
