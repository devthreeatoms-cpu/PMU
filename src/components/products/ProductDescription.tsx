"use client";

import { Check } from "lucide-react";

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

/**
 * Normalizes messy product copy (inline ## / ### / * markers, missing newlines)
 * into structured blocks for clean storefront rendering.
 */
export function parseProductDescription(raw: string): Block[] {
  if (!raw?.trim()) return [];

  // Insert structure where authors jammed markdown into one line.
  // One pass for #/##/### so "##" never splits a "###" heading.
  let text = raw
    .replace(/\r\n/g, "\n")
    .replace(/\s*(#{1,3})\s+/g, "\n$1 ")
    // bullet markers between items
    .replace(/\s+\*\s+/g, "\n* ")
    .replace(/\s+-\s+(?=[A-Z0-9])/g, "\n- ")
    .trim();

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const blocks: Block[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length) {
      blocks.push({ type: "list", items: listBuffer });
      listBuffer = [];
    }
  };

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      flushList();
      blocks.push({ type: "heading", level: 3, text: cleanInline(h3[1]) });
      continue;
    }
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      flushList();
      // Long "## Title Body…" lines: split title (first ~6 words) from body when obvious
      const full = cleanInline(h2[1]);
      const split = splitTitleAndBody(full);
      if (split) {
        blocks.push({ type: "heading", level: 2, text: split.title });
        if (split.body) blocks.push({ type: "paragraph", text: split.body });
      } else {
        blocks.push({ type: "heading", level: 2, text: full });
      }
      continue;
    }
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      flushList();
      blocks.push({ type: "heading", level: 2, text: cleanInline(h1[1]) });
      continue;
    }
    const bullet = line.match(/^[\*\-•]\s+(.+)$/);
    if (bullet) {
      listBuffer.push(cleanInline(bullet[1]));
      continue;
    }
    flushList();
    blocks.push({ type: "paragraph", text: cleanInline(line) });
  }
  flushList();

  return blocks;
}

function cleanInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** When heading text is really "Title + long paragraph", peel title off. */
function splitTitleAndBody(full: string): { title: string; body: string } | null {
  // Product names are usually short; if the whole line is long, try splitting after name-like chunk
  if (full.length < 80) return null;

  // Prefer split before "Upgrade", "Discover", "Experience", "Our", "Featuring", "These", "Crafted"
  const m = full.match(
    /^(.{8,60}?)(\s+(?:Upgrade|Discover|Experience|Elevate|Transform|Our|Featuring|These|Crafted|Designed|Perfect|Ideal|Made|Built)\b[\s\S]+)$/i
  );
  if (m) return { title: m[1].trim(), body: m[2].trim() };

  // Fallback: first sentence if multiple
  const sentence = full.match(/^(.{10,70}?)([.!?]\s+)([\s\S]+)$/);
  if (sentence && sentence[1].split(" ").length <= 10) {
    return { title: sentence[1].trim(), body: (sentence[3] || "").trim() };
  }

  return null;
}

function isPerfectForHeading(text: string) {
  return /perfect for|ideal for|best for|use cases|applications|suitable for/i.test(text);
}

interface ProductDescriptionProps {
  description: string;
  /** When set, skips a leading H2 that only repeats the product title */
  productName?: string;
  className?: string;
}

export function ProductDescription({
  description,
  productName,
  className = "",
}: ProductDescriptionProps) {
  const blocks = parseProductDescription(description);

  if (!blocks.length) return null;

  return (
    <div className={`space-y-5 md:space-y-6 ${className}`}>
      {blocks.map((block, i) => {
        if (block.type === "heading" && block.level === 2) {
          // Avoid duplicating the main product title already rendered above
          if (
            productName &&
            block.text.toLowerCase().replace(/\s+/g, " ") ===
              productName.toLowerCase().replace(/\s+/g, " ")
          ) {
            return null;
          }
          return (
            <h2
              key={i}
              className="text-lg md:text-xl font-heading text-zinc-900 tracking-tight"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "heading" && block.level === 3) {
          return (
            <h3
              key={i}
              className="text-[11px] font-bold tracking-[0.22em] uppercase text-brand-gold pt-2"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={i}
              className="text-[15px] md:text-base text-zinc-600 font-light leading-relaxed"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "list") {
          // Look back for heading context via previous blocks
          const prev = blocks[i - 1];
          const headingText =
            prev?.type === "heading" ? prev.text : "";
          const asChips = isPerfectForHeading(headingText);

          if (asChips) {
            return (
              <ul key={i} className="flex flex-wrap gap-2">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="inline-flex items-center rounded-full border border-brand-gold/25 bg-brand-rose/30 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-zinc-800"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <ul key={i} className="space-y-2.5">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-[14px] text-zinc-700 leading-snug">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span className="font-light">{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
}
