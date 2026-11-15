# The Becoming: exhibition gallery

The Next.js gallery for The Becoming. It shows each iteration's image next to the agent's own critique, with the style guide evolving across iterations. The project overview is in the root `README.md`.

## Getting started

Prerequisites: Node and pnpm (pinned by `packageManager` in `package.json`).

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

## Scripts

```bash
pnpm dev      # next dev
pnpm build    # next build
pnpm start    # next start
pnpm lint     # eslint
```

## Structure

```
app/          # routes and layout (app/page.tsx is the single exhibition page)
components/   # gallery components
data/         # critiques, transfer test, artist statement, per-iteration style guides
lib/          # data loading helpers
public/       # gallery images, cover art and demo media
```

Next.js 16, React 19 and Tailwind CSS 4. There is no deployment at the moment.
