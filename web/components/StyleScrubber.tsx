"use client";

import { useState, type ReactNode } from "react";

export interface StyleStep {
  n: number;
  id: string;
  era: string | null;
  version: number | null;
  /** pre-rendered prose for this snapshot */
  body: ReactNode;
}

/**
 * Scrub through the style guide as Hermes rewrote it, snapshot by snapshot.
 * The leftmost step is "v0 — undecided" (the blank book before it had taste).
 */
export function StyleScrubber({ steps }: { steps: StyleStep[] }) {
  const v0: StyleStep = {
    n: 0,
    id: "000",
    era: "Undecided",
    version: 0,
    body: (
      <div className="prose-quiet">
        <p className="my-3">
          The book is blank. Hermes has no palette it prefers, no subject it
          returns to, no opinion about edges or light. It does not yet know that
          it likes rust against teal, or that it will keep painting a single
          figure who never leaves.
        </p>
        <p className="my-3 text-bone-faint">
          Everything below is written after it starts looking at its own work.
        </p>
      </div>
    ),
  };

  const all = [v0, ...steps];
  const [i, setI] = useState(all.length - 1);
  const current = all[Math.min(i, all.length - 1)];

  return (
    <div>
      {/* scrubber rail */}
      <div className="flex items-center gap-3">
        <span className="eyebrow shrink-0">v{current.version ?? "?"}</span>
        <input
          type="range"
          min={0}
          max={all.length - 1}
          step={1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          aria-label="Scrub through the style guide's evolution"
          className="hermes-range w-full"
        />
      </div>

      {/* version ticks */}
      <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
        {all.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setI(idx)}
            aria-current={idx === i}
            className={`text-micro tracking-wide transition-colors ${
              idx === i ? "text-rust-bright" : "text-bone-faint hover:text-bone-dim"
            }`}
          >
            v{s.version ?? idx}
            {idx < all.length - 1 ? <span className="px-1 text-hairline">·</span> : null}
          </button>
        ))}
      </div>

      {/* current snapshot */}
      <div className="mt-8 border-t border-hairline pt-8">
        <p className="eyebrow">
          {current.n === 0 ? "Before the first stroke" : `Written after iteration ${current.n}`}
        </p>
        <h3 className="mt-2 text-h2 font-display leading-[1.02] tracking-tight">
          <span className="text-bone-faint">v{current.version ?? 0} </span>
          <span className="text-bone">{current.era ?? "Untitled"}</span>
        </h3>
        <div className="mt-6 max-w-prose text-body">{current.body}</div>
      </div>

      <style>{`
        .hermes-range {
          -webkit-appearance: none;
          appearance: none;
          height: 2px;
          background: var(--color-hairline);
          border-radius: 2px;
          outline: none;
        }
        .hermes-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--color-rust-bright);
          cursor: pointer;
          border: 2px solid var(--color-ink-deep);
          box-shadow: 0 0 0 1px var(--color-rust);
        }
        .hermes-range::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--color-rust-bright);
          cursor: pointer;
          border: 2px solid var(--color-ink-deep);
        }
      `}</style>
    </div>
  );
}
