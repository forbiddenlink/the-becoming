# The Becoming: gallery

Next.js exhibition gallery for [The Becoming](../README.md): a scroll through every iteration
an AI agent painted while developing its own visual style, each piece beside the agent's own
self-critique.

**Live:** https://the-becoming-elizabeth-emersons-projects.vercel.app

## Quickstart

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. No environment variables are required; the app reads its content
straight from the markdown and images already committed under `data/` and `public/`.

## Stack

Next.js 16, React 19, Tailwind CSS 4, TypeScript. Fonts: Fraunces (display) + Hanken Grotesk
(body), loaded via `next/font/google` in `app/layout.tsx`.

## Layout

- `app/page.tsx`: the gallery page
- `app/layout.tsx`: fonts, metadata, OpenGraph/Twitter cards
- `lib/iterations.ts`, `lib/finale.ts`: read and shape the iteration/finale content
- `lib/render-style.tsx`: renders a style-guide snapshot
- `data/`: self-contained copy of the root project's markdown artifacts (`STYLE.md`,
  `critiques.md`, `transfer.md`, `artist_statement.md`, `styles/iterNNN.md`), so this app has
  everything it needs without reaching outside its own directory
- `public/gallery/`: the generated images for each iteration

## Scripts

```bash
pnpm dev      # dev server
pnpm build    # production build
pnpm start    # run the production build
pnpm lint     # eslint
```

## Deploy

Deployed on Vercel with this directory (`web/`) as the project root.

See the [root README](../README.md) for how the underlying agent loop produces the content
this app renders, and `AGENTS.md` for Next.js-version-specific conventions used in this app.
