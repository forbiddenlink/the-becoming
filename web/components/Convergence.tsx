import type { Iteration, Sketchbook } from "@/lib/iterations";

/**
 * The convergence: style_similarity_to_prev across iterations. Early on the
 * number lurches (Hermes is throwing out whole approaches); as it settles into
 * a voice, consecutive paintings resemble each other more, so the line climbs
 * and steadies. Era changes are marked as chapters along the floor.
 */
export function Convergence({ sketchbook }: { sketchbook: Sketchbook }) {
  const pts = sketchbook.iterations
    .filter((it): it is Iteration & { styleSim: number } => it.styleSim !== null)
    .map((it) => ({ n: it.n, v: it.styleSim }));

  if (pts.length < 2) {
    return (
      <p className="text-bone-faint">
        Not enough data yet — the convergence appears once Hermes has compared a
        few paintings to the ones before them.
      </p>
    );
  }

  // viewBox space
  const W = 1000;
  const H = 420;
  const padL = 56;
  const padR = 28;
  const padT = 28;
  const padB = 64;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const minN = pts[0].n;
  const maxN = pts[pts.length - 1].n;
  const spanN = Math.max(1, maxN - minN);

  const x = (n: number) => padL + ((n - minN) / spanN) * innerW;
  const y = (v: number) => padT + (1 - v) * innerH; // 0 at bottom, 1 at top

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.n).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${x(maxN).toFixed(1)},${(padT + innerH).toFixed(1)} L${x(minN).toFixed(1)},${(padT + innerH).toFixed(1)} Z`;

  const gridVals = [0, 0.25, 0.5, 0.75, 1];

  // era markers placed at the iteration each era begins (skip the very first,
  // it's implied by the opening)
  const markers = sketchbook.eras.filter((e) => e.firstIter >= minN && e.firstIter <= maxN);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Style similarity to the previous painting, plotted across ${pts.length} iterations. It begins erratic and trends toward stability as Hermes settles into a voice.`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="convFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-rust)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-rust)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal gridlines + value labels */}
        {gridVals.map((g) => (
          <g key={g}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(g)}
              y2={y(g)}
              stroke="var(--color-hairline)"
              strokeWidth={1}
              strokeDasharray={g === 0 ? "0" : "2 6"}
              opacity={g === 0 ? 0.9 : 0.5}
            />
            <text
              x={padL - 12}
              y={y(g) + 4}
              textAnchor="end"
              fontSize={13}
              fill="var(--color-bone-faint)"
              fontFamily="var(--font-sans)"
            >
              {g.toFixed(2)}
            </text>
          </g>
        ))}

        {/* area + line */}
        <path d={areaPath} fill="url(#convFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-rust-bright)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* points */}
        {pts.map((p) => (
          <circle
            key={p.n}
            cx={x(p.n)}
            cy={y(p.v)}
            r={3.5}
            fill="var(--color-ink-deep)"
            stroke="var(--color-rust-bright)"
            strokeWidth={2}
          />
        ))}

        {/* era chapter markers */}
        {markers.map((m) => (
          <g key={m.era}>
            <line
              x1={x(m.firstIter)}
              x2={x(m.firstIter)}
              y1={padT}
              y2={padT + innerH}
              stroke="var(--color-teal)"
              strokeWidth={1}
              opacity={0.35}
              strokeDasharray="3 4"
            />
            <text
              x={x(m.firstIter)}
              y={padT + innerH + 22}
              textAnchor="middle"
              fontSize={12}
              fill="var(--color-teal)"
              fontFamily="var(--font-sans)"
              opacity={0.9}
            >
              {`iter ${String(m.firstIter).padStart(3, "0")}`}
            </text>
            <text
              x={x(m.firstIter)}
              y={padT + innerH + 40}
              textAnchor="middle"
              fontSize={12.5}
              fill="var(--color-bone-dim)"
              fontFamily="var(--font-display)"
            >
              {truncate(m.era, 22)}
            </text>
          </g>
        ))}

        {/* axis titles */}
        <text
          x={padL}
          y={H - 8}
          fontSize={12}
          fill="var(--color-bone-faint)"
          fontFamily="var(--font-sans)"
          letterSpacing="0.18em"
        >
          ITERATION →
        </text>
        <text
          x={16}
          y={padT + innerH / 2}
          fontSize={12}
          fill="var(--color-bone-faint)"
          fontFamily="var(--font-sans)"
          letterSpacing="0.18em"
          transform={`rotate(-90 16 ${padT + innerH / 2})`}
          textAnchor="middle"
        >
          ↑ RESEMBLANCE TO PREVIOUS
        </text>
      </svg>
    </figure>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
