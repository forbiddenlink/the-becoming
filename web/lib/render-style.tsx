import { Fragment, type ReactNode } from "react";

/**
 * Minimal renderer for the style-guide markdown Hermes writes. It only handles
 * the constructs those files actually use: # / ## headings, **bold**, *italic*,
 * and `- ` bullet lists. No dependency, no dangerouslySetInnerHTML.
 */

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  // split on **bold** and *italic*, keeping delimiters
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith("**") && part.endsWith("**")) {
      out.push(<strong key={`${keyBase}-b${i}`}>{part.slice(2, -2)}</strong>);
    } else if (part.startsWith("*") && part.endsWith("*")) {
      out.push(<em key={`${keyBase}-i${i}`}>{part.slice(1, -1)}</em>);
    } else {
      out.push(<Fragment key={`${keyBase}-t${i}`}>{part}</Fragment>);
    }
  });
  return out;
}

export function renderStyleMarkdown(md: string): ReactNode {
  const lines = md.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    const items = [...list];
    blocks.push(
      <ul key={`ul-${key++}`} className="my-4 space-y-2 pl-5">
        {items.map((item, i) => (
          <li key={i} className="list-disc marker:text-rust/70">
            {inline(item, `li-${key}-${i}`)}
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("# ")) {
      flushList();
      // skip the top "# Style Guide — vN" title; it's shown as the era header
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h3 key={`h-${key++}`} className="mt-7 mb-2 text-h3 font-display">
          {inline(line.slice(3), `h-${key}`)}
        </h3>
      );
      continue;
    }
    if (/^\s*-\s+/.test(line)) {
      list.push(line.replace(/^\s*-\s+/, ""));
      continue;
    }
    if (line.trim() === "") {
      flushList();
      continue;
    }
    flushList();
    blocks.push(
      <p key={`p-${key++}`} className="my-3">
        {inline(line, `p-${key}`)}
      </p>
    );
  }
  flushList();

  return <div className="prose-quiet">{blocks}</div>;
}
