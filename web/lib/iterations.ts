import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Hermes writes three artifacts each iteration:
 *  - gallery/iterNNN.png   the image it just painted
 *  - critiques.md          repeating blocks of subject / self-critique / similarity
 *  - styles/iterNNN.md      a snapshot of the style guide it rewrote afterwards
 *
 * The run is live, so any of these may lag the others. Every field here is
 * optional-tolerant: an iteration can have an image but no parsed critique yet,
 * or a critique with the similarity score still missing.
 */

export interface Iteration {
  /** iteration number, 1-based */
  n: number;
  /** padded id, e.g. "007" */
  id: string;
  /** public path to the plate, or null if the image is not on disk yet */
  img: string | null;
  /** what Hermes chose to paint */
  subject: string | null;
  /** Hermes' self-critique of its own output */
  critique: string | null;
  /** style_similarity_to_prev, 0..1 — rises as the voice stabilises */
  styleSim: number | null;
  /** era name parsed from the style-guide snapshot, e.g. "Last Light" */
  era: string | null;
  /** raw markdown of the style guide written after this iteration */
  styleMarkdown: string | null;
  /** ISO timestamp from the critique header, if present */
  timestamp: string | null;
}

export interface Sketchbook {
  iterations: Iteration[];
  count: number;
  /** latest era name Hermes is currently working in */
  currentEra: string | null;
  /** full text of the live STYLE.md */
  currentStyle: string | null;
  /** ordered, de-duplicated list of eras with the iteration each began */
  eras: { era: string; firstIter: number; version: number | null }[];
}

// Markdown artifacts are materialised into web/data/ and the rendered plates
// live under web/public/gallery/ — both self-contained so the app deploys with
// Vercel Root Directory = web/ without reaching outside the project.
const DATA = path.join(process.cwd(), "data");
const GALLERY = path.join(process.cwd(), "public", "gallery");

async function readMaybe(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return null;
  }
}

/** Pull the era name out of a style-guide first line:
 *  `# Style Guide — v7: "Liminal Vigil: ..."` -> { version: 7, era: "Liminal Vigil: ..." } */
function parseEra(md: string | null): { version: number | null; era: string | null } {
  if (!md) return { version: null, era: null };
  const firstLine = md.split("\n", 1)[0] ?? "";
  const quoted = firstLine.match(/"([^"]+)"/);
  const version = firstLine.match(/v(\d+)\s*:/i);
  return {
    version: version ? Number(version[1]) : null,
    era: quoted ? quoted[1].trim() : null,
  };
}

interface CritiqueBlock {
  n: number;
  subject: string | null;
  critique: string | null;
  styleSim: number | null;
  timestamp: string | null;
}

/** Parse the repeating critique blocks. The agent sometimes retries an
 *  iteration number, emitting several blocks with the same `n`; we keep the
 *  LAST block for each number (its most recent take on that plate). */
function parseCritiques(md: string | null): Map<number, CritiqueBlock> {
  const byN = new Map<number, CritiqueBlock>();
  if (!md) return byN;

  // Split on the iteration headers, keeping the header with its body.
  const blocks = md.split(/^##\s+iter\s+/im).slice(1);
  for (const raw of blocks) {
    const headerMatch = raw.match(/^(\d+)\s*(?:[—\-–]\s*(.+))?$/m);
    if (!headerMatch) continue;
    const n = Number(headerMatch[1]);
    if (!Number.isFinite(n)) continue;

    const tsLine = raw.split("\n", 1)[0] ?? "";
    const tsMatch = tsLine.match(/(\d{4}-\d{2}-\d{2}T[\d:.+Z-]+)/);

    const field = (name: string): string | null => {
      const re = new RegExp(`^-\\s*${name}\\s*:\\s*(.+)$`, "im");
      const m = raw.match(re);
      return m ? m[1].trim() : null;
    };

    const simRaw = field("style_similarity_to_prev");
    const sim = simRaw !== null ? Number(simRaw) : null;

    byN.set(n, {
      n,
      subject: field("subject"),
      critique: field("critique"),
      styleSim: sim !== null && Number.isFinite(sim) ? sim : null,
      timestamp: tsMatch ? tsMatch[1] : null,
    });
  }
  return byN;
}

/** Discover which iterations actually have artifacts on disk. */
async function discoverNumbers(): Promise<number[]> {
  const found = new Set<number>();

  const styleDir = path.join(DATA, "styles");
  for (const file of (await fs.readdir(styleDir).catch(() => [] as string[]))) {
    const m = file.match(/^iter(\d+)\.md$/i);
    if (m) found.add(Number(m[1]));
  }

  const galleryDir = GALLERY;
  for (const file of (await fs.readdir(galleryDir).catch(() => [] as string[]))) {
    const m = file.match(/^iter(\d+)\.png$/i);
    if (m) found.add(Number(m[1]));
  }

  return [...found];
}

export async function getSketchbook(): Promise<Sketchbook> {
  const [critiquesMd, currentStyle, numbers] = await Promise.all([
    readMaybe(path.join(DATA, "critiques.md")),
    readMaybe(path.join(DATA, "STYLE.md")),
    discoverNumbers(),
  ]);

  const critiques = parseCritiques(critiquesMd);
  // Union of numbers seen on disk and numbers seen in critiques.
  for (const n of critiques.keys()) numbers.push(n);
  const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);

  const iterations: Iteration[] = await Promise.all(
    uniqueNumbers.map(async (n): Promise<Iteration> => {
      const id = String(n).padStart(3, "0");
      const styleMarkdown = await readMaybe(path.join(DATA, "styles", `iter${id}.md`));
      const { era } = parseEra(styleMarkdown);
      const galleryPath = path.join(GALLERY, `iter${id}.png`);
      const hasImg = await fs
        .access(galleryPath)
        .then(() => true)
        .catch(() => false);
      const c = critiques.get(n);

      return {
        n,
        id,
        img: hasImg ? `/gallery/iter${id}.png` : null,
        subject: c?.subject ?? null,
        critique: c?.critique ?? null,
        styleSim: c?.styleSim ?? null,
        era,
        styleMarkdown,
        timestamp: c?.timestamp ?? null,
      };
    })
  );

  // Carry the era forward for iterations whose style snapshot is missing,
  // so the timeline never shows a hole.
  let lastEra: string | null = null;
  for (const it of iterations) {
    if (it.era) lastEra = it.era;
    else it.era = lastEra;
  }

  // Ordered, de-duplicated era list with the iteration each first appears.
  const eras: Sketchbook["eras"] = [];
  for (const it of iterations) {
    if (!it.era) continue;
    if (eras.length === 0 || eras[eras.length - 1].era !== it.era) {
      const { version } = parseEra(it.styleMarkdown);
      eras.push({ era: it.era, firstIter: it.n, version });
    }
  }

  const { era: currentEra } = parseEra(currentStyle);

  return {
    iterations,
    count: iterations.length,
    currentEra: currentEra ?? (eras.length ? eras[eras.length - 1].era : null),
    currentStyle,
    eras,
  };
}
