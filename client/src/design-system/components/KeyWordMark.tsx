import type { CSSProperties, ReactNode } from "react";
import { PRECEPT_GLYPHS } from "../../marking/glyphs";
import type { MarkRecipe, MarkSymbol, PencilColor } from "../../marking/recipe";
import { CSS_OUTLINES, shapePath, shapePosition } from "../../marking/shapes";
import { cn } from "../cn";

const ink = (color: PencilColor) => `var(--pencil-${color})`;
const wash = (color: PencilColor) => `var(--pencil-${color}-wash)`;

/**
 * One symbol: a Precept glyph (SVG), a Bootstrap icon, or short text. Text is
 * drawn through CSS `content` so it never becomes part of the passage text
 * (selection offsets depend on that).
 */
export const Glyph = ({ symbol, placement, className }: { symbol: MarkSymbol; placement?: string; className?: string }) => {
  const style = {
    "--kw-sym": ink(symbol.color),
    "--kw-sym-fill": symbol.fill ? wash(symbol.fill) : "transparent",
  } as CSSProperties;
  const place = placement ?? symbol.placement;
  const [kind, name] = [symbol.glyph.slice(0, symbol.glyph.indexOf(":")), symbol.glyph.slice(symbol.glyph.indexOf(":") + 1)];

  if (kind === "p") {
    const glyph = PRECEPT_GLYPHS[name];
    return (
      <span aria-hidden className={cn("kw-sym", className)} data-place={place} data-kind="p" style={style}>
        <svg viewBox="0 0 24 24">
          {glyph?.fill && symbol.fill ? <path className="g-fill" d={glyph.fill} /> : null}
          <path className="g-stroke" d={glyph?.d ?? ""} />
        </svg>
      </span>
    );
  }
  if (kind === "bi") {
    return <i aria-hidden className={cn("kw-sym bi", `bi-${name}`, className)} data-place={place} data-kind="bi" style={style} />;
  }
  return <span aria-hidden className={cn("kw-sym", className)} data-place={place} data-kind="t" data-glyph={name} style={style} />;
};

type KeyWordMarkProps = {
  recipe: MarkRecipe;
  children: ReactNode;
  /** Character count of the marked text, so drawn outlines keep even bumps. */
  length: number;
  dimmed?: boolean;
  title?: string;
  className?: string;
  id?: string;
};

/** Draws a key-word recipe around a run of text. */
export const KeyWordMark = ({ recipe, children, length, dimmed, title, className, id }: KeyWordMarkProps) => {
  const { outline, underline, symbol, modifiers } = recipe;
  const style: Record<string, string> = {};
  if (recipe.wash) {
    style["--kw-wash"] = Array.isArray(recipe.wash)
      ? `linear-gradient(90deg, ${wash(recipe.wash[0])} 50%, ${wash(recipe.wash[1])} 50%)`
      : wash(recipe.wash);
  }
  if (outline) style["--kw-outline"] = ink(outline.color);
  if (underline) style["--kw-underline"] = ink(underline.color);

  const cssOutline = outline && CSS_OUTLINES.has(outline.shape) ? outline.shape : undefined;
  const drawn = outline && !cssOutline ? shapePath(outline.shape, length) : null;
  const patterned = underline && (underline.style === "zigzag" || underline.style === "scallop");

  return (
    <span
      className={cn("kw", dimmed && "is-dimmed", className)}
      data-outline={cssOutline}
      data-underline={underline?.style}
      data-mark-id={id}
      title={title}
      style={style as CSSProperties}
    >
      {drawn && outline ? (
        <span aria-hidden className="kw-shape" data-pos={shapePosition(outline.shape)}>
          <svg viewBox={`0 0 ${drawn.w} ${drawn.h}`} preserveAspectRatio="none">
            <path d={drawn.d} />
          </svg>
        </span>
      ) : null}
      {symbol && (symbol.placement === "before" || symbol.placement === "ends") ? (
        <Glyph symbol={symbol} placement="before" />
      ) : null}
      <span className="kw-text">{children}</span>
      {symbol && (symbol.placement === "after" || symbol.placement === "ends") ? <Glyph symbol={symbol} placement="after" /> : null}
      {symbol && (symbol.placement === "above" || symbol.placement === "over") ? <Glyph symbol={symbol} /> : null}
      {patterned && underline ? <span aria-hidden className="kw-ul" data-pattern={underline.style} /> : null}
      {modifiers?.map((mod, i) =>
        mod.kind === "arrowsUp" ? (
          <span key={i} aria-hidden style={{ "--kw-mod": ink(mod.color) } as CSSProperties}>
            <i className="kw-arrow bi bi-arrow-up" data-side="start" />
            <i className="kw-arrow bi bi-arrow-up" data-side="end" />
          </span>
        ) : (
          <span key={i} aria-hidden className="kw-mod" style={{ "--kw-mod": ink(mod.color) } as CSSProperties}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              {mod.kind === "slash" || mod.kind === "cross" ? <line x1="8" y1="96" x2="92" y2="4" /> : null}
              {mod.kind === "cross" ? <line x1="8" y1="4" x2="92" y2="96" /> : null}
              {mod.kind === "strike" ? <line x1="0" y1="55" x2="100" y2="55" /> : null}
            </svg>
          </span>
        ),
      )}
    </span>
  );
};

/** A key word's name drawn with its own mark: the clearest legend there is. */
export const KeyWordSample = ({ recipe, text, className }: { recipe: MarkRecipe; text: string; className?: string }) => (
  <span className={cn("isolate inline-block font-scripture leading-[2.2]", className)}>
    <KeyWordMark recipe={recipe} length={text.length}>
      {text}
    </KeyWordMark>
  </span>
);
