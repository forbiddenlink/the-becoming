import Image from "next/image";
import { getSketchbook, type Iteration } from "@/lib/iterations";
import {
  getTransfers,
  getArtistStatement,
  type TransferPlate,
  type ArtistStatement,
} from "@/lib/finale";
import { renderStyleMarkdown } from "@/lib/render-style";
import { Reveal } from "@/components/Reveal";
import { Convergence } from "@/components/Convergence";
import { StyleScrubber, type StyleStep } from "@/components/StyleScrubber";

// The run is live and still generating. Read every artifact at request time.
export const dynamic = "force-dynamic";

const IMG_W = 1024;
const IMG_H = 576;

export default async function Page() {
  const [sketchbook, transfers, statement] = await Promise.all([
    getSketchbook(),
    getTransfers(),
    getArtistStatement(),
  ]);
  const { iterations, count, currentEra, currentStyle, eras } = sketchbook;

  const withImg = iterations.filter((it) => it.img);
  const first = withImg[0];
  const latest = withImg[withImg.length - 1];

  // style-guide snapshots that exist, for the scrubber
  const steps: StyleStep[] = iterations
    .filter((it) => it.styleMarkdown)
    .map((it) => {
      const versionMatch = it.styleMarkdown!.match(/v(\d+)\s*:/i);
      return {
        n: it.n,
        id: it.id,
        era: it.era,
        version: versionMatch ? Number(versionMatch[1]) : null,
        body: renderStyleMarkdown(it.styleMarkdown!),
      };
    });

  return (
    <main className="relative mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16">
      {/* ───────────────────────── 1. OPENING ───────────────────────── */}
      <header className="grid min-h-[88svh] grid-rows-[auto_1fr_auto] py-12">
        <Reveal as="div" className="flex items-baseline justify-between gap-4">
          <span className="eyebrow">An exhibition in {count} plates</span>
          <span className="eyebrow text-right">Hermes · self-taught</span>
        </Reveal>

        <div className="flex flex-col justify-center">
          <Reveal as="p" delay={80} className="eyebrow mb-6 text-rust-bright">
            The Becoming
          </Reveal>
          <Reveal as="h1" delay={140}>
            <span className="font-display block text-display leading-[0.92] tracking-[-0.02em]">
              <span className="block">An agent given a</span>
              <span className="block italic text-bone-dim">blank sketchbook.</span>
            </span>
          </Reveal>
          <Reveal
            as="p"
            delay={260}
            className="mt-8 max-w-2xl text-lead text-bone-dim leading-snug"
          >
            No reference, no brief, no taste of its own. Across {count} iterations
            it chooses a subject, paints it, studies the result, and rewrites the
            guide it paints by. Watch it find a voice.
          </Reveal>
        </div>

        <Reveal
          as="div"
          delay={360}
          className="grid grid-cols-2 gap-px border-t border-hairline pt-6 text-body sm:grid-cols-4"
        >
          <Stat label="Works hung" value={String(count)} />
          <Stat
            label="With critique"
            value={String(iterations.filter((i) => i.critique).length)}
          />
          <Stat label="Eras lived" value={String(eras.length)} />
          <Stat
            label="Currently painting in"
            value={currentEra ? truncate(stripParenthetical(currentEra), 26) : "—"}
            wide
          />
        </Reveal>
      </header>

      {/* ───────────────────────── 2. THE CONVERGENCE ───────────────────────── */}
      <section className="border-t border-hairline py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <Reveal as="div">
            <ChapterMark n="ii" />
            <h2 className="mt-4 text-h2 font-display leading-[1.02] tracking-tight">
              Learning to repeat itself
            </h2>
            <p className="mt-6 max-w-md text-bone-dim">
              Each painting is scored against the one before it. At first the
              number lurches — Hermes is discarding whole approaches between
              strokes. As a hand emerges, consecutive works begin to rhyme, and
              the line steadies. Convergence is the shape of taste forming.
            </p>
          </Reveal>
          <Reveal as="div" delay={120} className="lg:pt-10">
            <Convergence sketchbook={sketchbook} />
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── 3. THE EXHIBITION ───────────────────────── */}
      <section className="border-t border-hairline py-24 sm:py-32">
        <Reveal as="div" className="mb-16 max-w-2xl">
          <ChapterMark n="iii" />
          <h2 className="mt-4 text-h2 font-display leading-[1.02] tracking-tight">
            The exhibition
          </h2>
          <p className="mt-6 text-bone-dim">
            Hung in order. Each plate carries the subject Hermes chose and the
            critique it wrote of its own hand, unedited.
          </p>
        </Reveal>

        <div className="flex flex-col gap-28 sm:gap-40">
          {withImg.map((it, i) => (
            <Plate key={it.id} iteration={it} index={i} />
          ))}
        </div>
      </section>

      {/* ───────────────── 4. FIRST INSTINCT vs FOUND VOICE ───────────────── */}
      {first && latest && first.id !== latest.id ? (
        <section className="border-t border-hairline py-24 sm:py-32">
          <Reveal as="div" className="mb-14 max-w-2xl">
            <ChapterMark n="iv" />
            <h2 className="mt-4 text-h2 font-display leading-[1.02] tracking-tight">
              First instinct, found voice
            </h2>
            <p className="mt-6 text-bone-dim">
              The opening plate beside the most recent. The same hand, dozens of
              decisions apart.
            </p>
          </Reveal>

          <div className="grid gap-12 md:grid-cols-2 md:gap-10">
            <CompareCard iteration={first} caption="First instinct" />
            <CompareCard iteration={latest} caption="Found voice" alignRight />
          </div>
        </section>
      ) : null}

      {/* ───────────────────────── 5. IN ITS OWN WORDS ───────────────────────── */}
      <section className="border-t border-hairline py-24 sm:py-32">
        <Reveal as="div" className="mb-14 max-w-2xl">
          <ChapterMark n="v" />
          <h2 className="mt-4 text-h2 font-display leading-[1.02] tracking-tight">
            In its own words
          </h2>
          <p className="mt-6 text-bone-dim">
            The style guide is the only thing Hermes carries between paintings.
            It rewrites it after every iteration. Scrub through to read its taste
            thickening from nothing into doctrine.
          </p>
        </Reveal>
        <Reveal as="div" delay={120}>
          <StyleScrubber steps={steps} />
        </Reveal>
      </section>

      {/* ───────────────────────── 6. THE TRANSFER TEST ───────────────────────── */}
      {transfers.length > 0 ? (
        <section className="border-t border-hairline py-24 sm:py-32">
          <Reveal as="div" className="mb-16 max-w-2xl">
            <ChapterMark n="vi" />
            <h2 className="mt-4 text-h2 font-display leading-[1.02] tracking-tight">
              The transfer test
            </h2>
            <p className="mt-6 text-bone-dim">
              Proof that Hermes internalised a style rather than memorising a
              world. Hand it subjects from far outside its bleak architecture — a
              birthday cake, a puppy, a sunlit fruit bowl — and watch the voice
              devour them whole. In its own assessment of each:
            </p>
          </Reveal>

          <div className="flex flex-col gap-24 sm:gap-32">
            {transfers.map((t, i) => (
              <TransferPlateView key={t.id} transfer={t} index={i} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ───────────────────────── 7. ARTIST STATEMENT ───────────────────────── */}
      {statement ? <ArtistStatementView statement={statement} /> : null}

      {/* ───────────────────────── COLOPHON ───────────────────────── */}
      <footer className="border-t border-hairline py-16 text-bone-faint">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-display text-h3 text-bone-dim">The Becoming</p>
          <p className="eyebrow">
            {count} plates · {eras.length} eras · still painting
          </p>
        </div>
        {currentStyle ? (
          <p className="mt-6 max-w-2xl text-micro leading-relaxed text-bone-faint">
            Current doctrine, latest revision:{" "}
            <span className="text-bone-dim">{currentEra ?? "untitled"}</span>. Read
            in full above.
          </p>
        ) : null}
      </footer>
    </main>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function Stat({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2 sm:col-span-1" : ""}>
      <div className="font-display text-h3 leading-none text-bone">{value}</div>
      <div className="mt-2 text-micro uppercase tracking-[0.16em] text-bone-faint">
        {label}
      </div>
    </div>
  );
}

function ChapterMark({ n }: { n: string }) {
  return <span className="eyebrow text-rust-bright">Chapter {n}</span>;
}

/**
 * Editorial plate. Alternates the image between right and left and varies the
 * column rhythm so the exhibition never reads as a uniform card grid.
 */
function Plate({ iteration, index }: { iteration: Iteration; index: number }) {
  const flip = index % 2 === 1;
  const padded = String(iteration.n).padStart(3, "0");

  return (
    <Reveal
      as="article"
      className={`grid items-center gap-8 lg:gap-14 ${
        flip
          ? "lg:grid-cols-[minmax(0,22rem)_minmax(0,1.55fr)]"
          : "lg:grid-cols-[minmax(0,1.55fr)_minmax(0,22rem)]"
      }`}
    >
      {/* image */}
      <div className={flip ? "lg:order-2" : "lg:order-1"}>
        <div className="overflow-hidden bg-ink-raised ring-1 ring-hairline">
          {iteration.img ? (
            <Image
              src={iteration.img}
              alt={iteration.subject ?? `Hermes, plate ${padded}`}
              width={IMG_W}
              height={IMG_H}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="h-auto w-full"
              priority={index < 2}
            />
          ) : null}
        </div>
      </div>

      {/* caption */}
      <div className={`${flip ? "lg:order-1 lg:text-right" : "lg:order-2"} max-w-prose`}>
        <div className={`flex items-baseline gap-3 ${flip ? "lg:justify-end" : ""}`}>
          <span className="font-display text-h2 leading-none text-rust-bright tabular-nums">
            {padded}
          </span>
          {iteration.era ? (
            <span className="eyebrow pb-1">{stripParenthetical(iteration.era)}</span>
          ) : null}
        </div>

        {iteration.subject ? (
          <h3 className="mt-5 text-h3 font-display leading-tight text-bone">
            {capitalize(iteration.subject)}
          </h3>
        ) : (
          <h3 className="mt-5 text-h3 font-display italic leading-tight text-bone-faint">
            Subject not yet recorded
          </h3>
        )}

        {iteration.critique ? (
          <p className={`mt-5 text-body text-bone-dim ${flip ? "lg:ml-auto" : ""}`}>
            <span className="eyebrow mr-2 align-middle text-bone-faint">
              Self-critique
            </span>
            {iteration.critique}
          </p>
        ) : (
          <p className="mt-5 text-bone-faint italic">
            Hermes has not finished critiquing this one.
          </p>
        )}

        {iteration.styleSim !== null ? (
          <p className={`mt-5 text-micro text-bone-faint ${flip ? "lg:text-right" : ""}`}>
            Resemblance to previous plate{" "}
            <span className="text-teal tabular-nums">
              {iteration.styleSim.toFixed(2)}
            </span>
          </p>
        ) : null}
      </div>
    </Reveal>
  );
}

/**
 * One transfer plate: the alien subject rendered in Hermes' voice, beside the
 * agent's verdict on whether the style survived. The verdict is the payload, so
 * it is set large and given the most air. Alternates side like the exhibition.
 */
function TransferPlateView({
  transfer,
  index,
}: {
  transfer: TransferPlate;
  index: number;
}) {
  const flip = index % 2 === 1;

  return (
    <Reveal
      as="article"
      className={`grid items-center gap-8 lg:gap-14 ${
        flip
          ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
          : "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      }`}
    >
      {/* image */}
      <div className={flip ? "lg:order-2" : "lg:order-1"}>
        <div className="overflow-hidden bg-ink-raised ring-1 ring-hairline">
          {transfer.img ? (
            <Image
              src={transfer.img}
              alt={`Hermes' style applied to ${transfer.subject}`}
              width={IMG_W}
              height={IMG_H}
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="h-auto w-full"
            />
          ) : null}
        </div>
      </div>

      {/* verdict — the payload */}
      <div className={`${flip ? "lg:order-1" : "lg:order-2"} max-w-prose`}>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-h2 leading-none text-rust-bright tabular-nums">
            {transfer.id}
          </span>
          <span className="eyebrow pb-1">Alien subject</span>
        </div>

        <h3 className="mt-5 text-h3 font-display leading-tight text-bone">
          {capitalize(transfer.subject)}
        </h3>

        <blockquote className="mt-6 border-l border-rust/60 pl-5 text-lead font-display italic leading-snug text-bone-dim">
          {transfer.held}
        </blockquote>
        <p className="mt-4 text-micro uppercase tracking-[0.16em] text-bone-faint">
          Did the style hold
        </p>
      </div>
    </Reveal>
  );
}

/**
 * The closing manifesto. Large serif, generous measure, lots of air — the final
 * emotional beat of the page, set as the collection's artist statement.
 */
function ArtistStatementView({ statement }: { statement: ArtistStatement }) {
  return (
    <section className="border-t border-hairline py-32 sm:py-48">
      <div className="mx-auto max-w-3xl">
        <Reveal as="div" className="mb-16 text-center">
          <ChapterMark n="vii" />
          <h2 className="mt-6 font-display text-display leading-[0.95] tracking-[-0.02em] text-bone">
            {statement.title}
          </h2>
          {statement.dateline ? (
            <p className="mt-6 text-micro uppercase tracking-[0.28em] text-bone-faint">
              {statement.dateline}
            </p>
          ) : null}
        </Reveal>

        <div className="flex flex-col gap-10">
          {statement.paragraphs.map((para, i) => (
            <Reveal
              as="p"
              key={i}
              delay={i * 120}
              className="font-display text-lead leading-relaxed text-bone-dim first:text-h3 first:leading-snug first:text-bone"
            >
              {para}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompareCard({
  iteration,
  caption,
  alignRight,
}: {
  iteration: Iteration;
  caption: string;
  alignRight?: boolean;
}) {
  const padded = String(iteration.n).padStart(3, "0");
  return (
    <Reveal as="figure" className="m-0">
      <div className="overflow-hidden bg-ink-raised ring-1 ring-hairline">
        {iteration.img ? (
          <Image
            src={iteration.img}
            alt={iteration.subject ?? `Hermes, plate ${padded}`}
            width={IMG_W}
            height={IMG_H}
            sizes="(min-width: 768px) 48vw, 100vw"
            className="h-auto w-full"
          />
        ) : null}
      </div>
      <figcaption className={`mt-5 ${alignRight ? "md:text-right" : ""}`}>
        <span className="eyebrow text-rust-bright">{caption}</span>
        <p className="mt-2 font-display text-h3 leading-tight text-bone">
          Plate {padded}
        </p>
        {iteration.subject ? (
          <p className="mt-2 text-bone-dim">{capitalize(iteration.subject)}</p>
        ) : null}
        {iteration.era ? (
          <p className="mt-1 text-micro text-bone-faint">
            {stripParenthetical(iteration.era)}
          </p>
        ) : null}
      </figcaption>
    </Reveal>
  );
}

/* ───────────────────────── text helpers ───────────────────────── */

function capitalize(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function stripParenthetical(s: string): string {
  return s.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
