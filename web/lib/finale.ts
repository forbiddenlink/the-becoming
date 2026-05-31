import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * The finale produced two closing artifacts, read at request time like the
 * rest of the run:
 *  - transfer.md          the style applied to alien subjects, in repeating
 *                         `## transfer NN: <subject>` / `- held: <quote>` blocks
 *  - artist_statement.md  a `# TITLE` then a reverent prose statement
 *
 * Both loaders are tolerant of a missing file (return null / []) so the page
 * can simply render nothing for an absent section rather than crash.
 */

// Self-contained: markdown lives in web/data/, plates in web/public/gallery/,
// so the app deploys with Vercel Root Directory = web/ without leaving the dir.
const DATA = path.join(process.cwd(), "data");
const GALLERY = path.join(process.cwd(), "public", "gallery");

async function readMaybe(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return null;
  }
}

export interface TransferPlate {
  /** transfer number, 1-based */
  n: number;
  /** padded id, e.g. "01" */
  id: string;
  /** the alien subject thrown at the style */
  subject: string;
  /** Hermes' self-assessment of whether its style survived — the payload */
  held: string;
  /** public path to the transfer plate, or null if not on disk */
  img: string | null;
}

/** Parse the repeating `## transfer NN: subject` / `- held: quote` blocks. */
export async function getTransfers(): Promise<TransferPlate[]> {
  const md = await readMaybe(path.join(DATA, "transfer.md"));
  if (!md) return [];

  const plates: TransferPlate[] = [];
  // Split on the transfer headers, keeping each header with its body.
  const blocks = md.split(/^##\s+transfer\s+/im).slice(1);

  for (const raw of blocks) {
    const headerMatch = raw.match(/^(\d+)\s*:\s*(.+)$/m);
    if (!headerMatch) continue;
    const n = Number(headerMatch[1]);
    if (!Number.isFinite(n)) continue;
    const subject = headerMatch[2].trim();

    const heldMatch = raw.match(/^-\s*held\s*:\s*([\s\S]+?)(?=\n##\s|\n*$)/im);
    const held = heldMatch ? heldMatch[1].replace(/\s+/g, " ").trim() : "";
    if (!held) continue;

    const id = String(n).padStart(2, "0");
    const galleryPath = path.join(GALLERY, `transfer${id}.png`);
    const hasImg = await fs
      .access(galleryPath)
      .then(() => true)
      .catch(() => false);

    plates.push({
      n,
      id,
      subject,
      held,
      img: hasImg ? `/gallery/transfer${id}.png` : null,
    });
  }

  plates.sort((a, b) => a.n - b.n);
  return plates;
}

export interface ArtistStatement {
  /** collection name from the first `# ` line, e.g. "SURGICAL DESCENTS" */
  title: string;
  /** italic dateline, if present, e.g. "Artist statement, 2026-05-29" */
  dateline: string | null;
  /** the statement body split into paragraphs */
  paragraphs: string[];
}

/** Parse the `# TITLE`, optional `_dateline_`, and prose body. */
export async function getArtistStatement(): Promise<ArtistStatement | null> {
  const md = await readMaybe(path.join(DATA, "artist_statement.md"));
  if (!md) return null;

  const lines = md.split("\n");
  let title: string | null = null;
  let dateline: string | null = null;
  const bodyLines: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (title === null && line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }
    // an emphasised dateline like _Artist statement, 2026-05-29_
    if (
      title !== null &&
      dateline === null &&
      bodyLines.length === 0 &&
      /^[_*].+[_*]$/.test(line)
    ) {
      dateline = line.replace(/^[_*]+|[_*]+$/g, "").trim();
      continue;
    }
    if (title !== null) bodyLines.push(raw);
  }

  if (!title) return null;

  const paragraphs = bodyLines
    .join("\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return { title, dateline, paragraphs };
}
