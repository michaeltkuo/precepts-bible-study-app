/**
 * A key-word mark is a recipe of up to five pencil strokes, the way Precept
 * students mark by hand: a colour wash, an outline around the word, an
 * underline, a small drawn symbol, and modifiers such as a "not" slash.
 * Every entry in the library, and every custom mark later on, is one recipe.
 */

export const PENCIL_COLORS = [
  "yellow",
  "orange",
  "red",
  "pink",
  "purple",
  "blue",
  "sky",
  "green",
  "forest",
  "brown",
  "gray",
  "black",
] as const;
export type PencilColor = (typeof PENCIL_COLORS)[number];

export const OUTLINE_SHAPES = [
  "box",
  "double",
  "rounded",
  "oval",
  "dashed",
  "brackets",
  "cloud",
  "bubble",
  "banner",
  "slant",
  "arrow",
  "jagged",
  "roof",
  "arch",
  "canopy",
  "bowl",
  "table",
  "castle",
] as const;
export type OutlineShape = (typeof OUTLINE_SHAPES)[number];

export const UNDERLINE_STYLES = ["single", "double", "dotted", "dashed", "wavy", "zigzag", "scallop"] as const;
export type UnderlineStyle = (typeof UNDERLINE_STYLES)[number];

export const MODIFIER_KINDS = ["slash", "strike", "cross", "arrowsUp"] as const;
export type ModifierKind = (typeof MODIFIER_KINDS)[number];

/** Where the symbol sits relative to the word. */
export const SYMBOL_PLACEMENTS = ["above", "over", "before", "after", "ends"] as const;
export type SymbolPlacement = (typeof SYMBOL_PLACEMENTS)[number];

/**
 * A symbol is a Precept glyph drawn for this app ("p:cross"), any Bootstrap
 * icon ("bi:heart-fill"), or short text such as a letter or "666" ("t:E").
 */
export type SymbolGlyph = `p:${string}` | `bi:${string}` | `t:${string}`;

export type MarkSymbol = {
  glyph: SymbolGlyph;
  color: PencilColor;
  placement: SymbolPlacement;
  /** Inside colour for outlined Precept glyphs, e.g. the yellow inside God's triangle. */
  fill?: PencilColor;
};

export type MarkRecipe = {
  /** One colour, or two for a split wash ("Jesus Christ", "the coming of the Lord"). */
  wash?: PencilColor | [PencilColor, PencilColor];
  outline?: { shape: OutlineShape; color: PencilColor };
  underline?: { style: UnderlineStyle; color: PencilColor };
  symbol?: MarkSymbol;
  modifiers?: Array<{ kind: ModifierKind; color: PencilColor }>;
};

/* ── Shorthand used by the library data ─────────────────────────────── */

type Short = {
  /** wash */
  w?: PencilColor | [PencilColor, PencilColor];
  /** outline: [shape, colour] */
  o?: [OutlineShape, PencilColor];
  /** underline: [style, colour] */
  u?: [UnderlineStyle, PencilColor];
  /** symbol: [glyph, colour, placement?, fill?] */
  s?: [SymbolGlyph, PencilColor, SymbolPlacement?, PencilColor?];
  /** modifiers: [kind, colour] pairs */
  m?: Array<[ModifierKind, PencilColor]>;
};

/** Expand the compact library notation into a full recipe. */
export const recipe = (short: Short): MarkRecipe => {
  const out: MarkRecipe = {};
  if (short.w) out.wash = short.w;
  if (short.o) out.outline = { shape: short.o[0], color: short.o[1] };
  if (short.u) out.underline = { style: short.u[0], color: short.u[1] };
  if (short.s) {
    out.symbol = { glyph: short.s[0], color: short.s[1], placement: short.s[2] ?? "over" };
    if (short.s[3]) out.symbol.fill = short.s[3];
  }
  if (short.m?.length) out.modifiers = short.m.map(([kind, color]) => ({ kind, color }));
  return out;
};

/** True when a recipe would draw nothing. */
export const isEmptyRecipe = (r: MarkRecipe) =>
  !r.wash && !r.outline && !r.underline && !r.symbol && !(r.modifiers && r.modifiers.length > 0);
