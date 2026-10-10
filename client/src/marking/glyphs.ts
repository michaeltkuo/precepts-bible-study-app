/**
 * Precept symbols drawn for this app, on a 24×24 grid with round 2px strokes,
 * for the marks Bootstrap Icons doesn't cover. `fill` is the region coloured
 * by a symbol's fill colour (the yellow inside God's triangle, for example).
 */
export type PreceptGlyph = { label: string; d: string; fill?: string };

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;

export const PRECEPT_GLYPHS: Record<string, PreceptGlyph> = {
  triangle: { label: "Triangle", d: "M12 3 L21.5 20 H2.5 Z", fill: "M12 3 L21.5 20 H2.5 Z" },
  triangleDown: { label: "Inverted triangle", d: "M2.5 4 H21.5 L12 21 Z", fill: "M2.5 4 H21.5 L12 21 Z" },
  cross: { label: "Cross", d: "M12 2 V22 M5.5 8 H18.5" },
  pitchfork: { label: "Pitchfork", d: "M12 22 V9 M6 3 V7 Q6 11 12 11 Q18 11 18 7 V3 M12 3 V11" },
  crown: {
    label: "Crown",
    d: "M3 19 L4 7 L9 12 L12 5 L15 12 L20 7 L21 19 Z",
    fill: "M3 19 L4 7 L9 12 L12 5 L15 12 L20 7 L21 19 Z",
  },
  star6: { label: "Star of David", d: "M12 2 L21 17.5 H3 Z M12 22 L3 6.5 H21 Z" },
  angel: {
    label: "Angel",
    d: `M8.5 2.6 Q12 0.6 15.5 2.6 Q12 4.6 8.5 2.6 Z ${circle(12, 7.5, 2.5)} M12 10 V16 M6.5 12.5 L12 11.5 L17.5 12.5 M12 16 L8 22 M12 16 L16 22`,
    fill: circle(12, 7.5, 2.5),
  },
  person: {
    label: "Person",
    d: `${circle(12, 5, 2.5)} M12 7.5 V15 M6 10.5 H18 M12 15 L7.5 21.5 M12 15 L16.5 21.5`,
    fill: circle(12, 5, 2.5),
  },
  beast: {
    label: "Beast",
    d: "M5 2.5 L8.5 8 M19 2.5 L15.5 8 M6.5 8 Q4 20 12 21 Q20 20 17.5 8 Z M9 13 H10.5 M13.5 13 H15",
    fill: "M6.5 8 Q4 20 12 21 Q20 20 17.5 8 Z",
  },
  clock: { label: "Clock", d: `${circle(12, 12, 9)} M12 12 V6.5 M12 12 L16 14.5`, fill: circle(12, 12, 9) },
  circleCross: { label: "Circle with cross", d: `${circle(12, 12, 9)} M12 3 V21 M3 12 H21`, fill: circle(12, 12, 9) },
  circle: { label: "Circle", d: circle(12, 12, 8), fill: circle(12, 12, 8) },
  peak: { label: "Peak", d: "M3 20 L12 4 L21 20" },
  mountain: { label: "Mountains", d: "M2 20 L8 8 L12 14 L16 6 L22 20" },
  idol: { label: "Idol", d: `${circle(12, 6, 3)} M9.5 9 L8 21 H16 L14.5 9 Z`, fill: "M9.5 9 L8 21 H16 L14.5 9 Z" },
  tablets: {
    label: "Tablets",
    d: "M3 21 V8 a4.5 4.5 0 0 1 9 0 V21 Z M12 21 V8 a4.5 4.5 0 0 1 9 0 V21 Z",
    fill: "M3 21 V8 a4.5 4.5 0 0 1 9 0 V21 Z M12 21 V8 a4.5 4.5 0 0 1 9 0 V21 Z",
  },
  vase: {
    label: "Prayer bowl",
    d: "M8 3 H16 M9 3 Q9 7 6 10 Q3 15 7 20 H17 Q21 15 18 10 Q15 7 15 3",
    fill: "M9 3 Q9 7 6 10 Q3 15 7 20 H17 Q21 15 18 10 Q15 7 15 3 Z",
  },
  scroll: { label: "Scroll", d: "M5 5 a2 2 0 0 1 4 0 V19 a2 2 0 0 1 -4 0 Z M9 5 H19 a2 2 0 0 1 0 4 M9 19 H17 a2 2 0 0 0 2 -2 V9" },
  garment: {
    label: "Garment",
    d: "M8 3 L3 7 L5 11 L7 10 V21 H17 V10 L19 11 L21 7 L16 3 Q12 6 8 3 Z",
    fill: "M8 3 L3 7 L5 11 L7 10 V21 H17 V10 L19 11 L21 7 L16 3 Q12 6 8 3 Z",
  },
  sword: { label: "Sword", d: "M12 2 V17 M10.5 3.5 L12 2 L13.5 3.5 M8 14 H16 M12 17 V21" },
  swords: { label: "Crossed swords", d: "M4 4 L20 20 M20 4 L4 20 M6 14 L10 18 M14 18 L18 14" },
  spear: { label: "Spear", d: "M4 20 L17 7 M14 5 L20 4 L19 10 Z", fill: "M14 5 L20 4 L19 10 Z" },
  glasses: { label: "Seeking eyes", d: `${circle(6, 13, 4)} ${circle(18, 13, 4)} M10 12 Q12 10 14 12` },
  throne: { label: "Throne", d: "M7 2 V21 M7 12 H17 V21 M7 2 H11 V12" },
  pennant: { label: "Pennant", d: "M5 21 V3 M5 4 L20 9 L5 14 Z", fill: "M5 4 L20 9 L5 14 Z" },
  tomb: { label: "Tomb", d: "M6 21 V9 a6 6 0 0 1 12 0 V21 Z M12 11 V17 M9.5 13.5 H14.5" },
  bread: { label: "Bread", d: "M4 13 Q2 6 9 6 Q12 3 15 6 Q22 6 20 13 V19 H4 Z", fill: "M4 13 Q2 6 9 6 Q12 3 15 6 Q22 6 20 13 V19 H4 Z" },
  anchor: { label: "Anchor", d: `${circle(12, 3.5, 1.5)} M12 5 V21 M8 9 H16 M4 15 Q5 21 12 21 Q19 21 20 15` },
  angle: { label: "Contrast angle", d: "M18 4 L6 20 H20" },
  post: { label: "Post", d: `${circle(12, 5, 2.5)} M12 7.5 V22` },
  mouth: { label: "Mouth", d: "M3 12 Q12 4 21 12 Q12 20 3 12 Z", fill: "M3 12 Q12 4 21 12 Q12 20 3 12 Z" },
};
