import type { OutlineShape } from "./recipe";

/** Outlines CSS can draw with a border; the rest are SVG paths. */
export const CSS_OUTLINES = new Set<OutlineShape>(["box", "double", "rounded", "oval", "dashed", "brackets"]);

/** "top" shapes sit above the word (a roof, an arch); "wrap" shapes reach past it (a table, a bowl). */
export const shapePosition = (shape: OutlineShape): "around" | "top" | "wrap" =>
  shape === "roof" || shape === "arch" || shape === "canopy" ? "top" : shape === "table" || shape === "bowl" ? "wrap" : "around";

/**
 * Path for a drawn outline in a W×H box that the browser stretches over the
 * word. W follows the word's length so bumps and spikes keep a steady size.
 */
export const shapePath = (shape: OutlineShape, chars: number): { d: string; w: number; h: number } => {
  const w = Math.max(28, Math.min(640, Math.round(chars * 6.5 + 14)));
  const pos = shapePosition(shape);
  const h = pos === "top" ? 12 : 24;
  const m = 1.5;

  const bumps = (size: number) => {
    const n = Math.max(2, Math.round((w - 2 * m) / size));
    const seg = (w - 2 * m) / n;
    const ry = Math.min(seg / 2, 6);
    let d = `M${m} ${m}`;
    for (let i = 1; i <= n; i += 1) d += ` A${seg / 2} ${ry} 0 0 1 ${m + seg * i} ${m}`;
    d += ` A5 ${(h - 2 * m) / 2} 0 0 1 ${w - m} ${h - m}`;
    for (let i = n - 1; i >= 0; i -= 1) d += ` A${seg / 2} ${ry} 0 0 1 ${m + seg * i} ${h - m}`;
    d += ` A5 ${(h - 2 * m) / 2} 0 0 1 ${m} ${m} Z`;
    return d;
  };

  const spikes = () => {
    const step = 6;
    let d = `M${m} ${h / 2} L${m} ${m + 3}`;
    for (let x = m, up = true; x < w - m; x += step / 2, up = !up) d += ` L${Math.min(x + step / 2, w - m)} ${up ? -2 : m + 3}`;
    d += ` L${w - m} ${h / 2} L${w - m} ${h - m - 3}`;
    for (let x = w - m, down = true; x > m; x -= step / 2, down = !down) d += ` L${Math.max(x - step / 2, m)} ${down ? h + 2 : h - m - 3}`;
    return `${d} Z`;
  };

  const battlements = () => {
    const tooth = 5;
    let d = `M${m} ${h - m} V6`;
    let x = m;
    let high = true;
    while (x < w - m) {
      const next = Math.min(x + tooth, w - m);
      d += high ? ` V${m} H${next}` : ` V6 H${next}`;
      x = next;
      high = !high;
    }
    return `${d} V${h - m} Z`;
  };

  const canopy = () => {
    const n = Math.max(2, Math.round(w / 9));
    const seg = (w - 2 * m) / n;
    let d = `M${m} ${h - m} V7`;
    for (let i = 1; i <= n; i += 1) d += ` A${seg / 2} 5 0 0 1 ${m + seg * i} 7`;
    return `${d} V${h - m}`;
  };

  const paths: Record<OutlineShape, () => string> = {
    box: () => "",
    double: () => "",
    rounded: () => "",
    oval: () => "",
    dashed: () => "",
    brackets: () => "",
    cloud: () => bumps(9),
    bubble: () => bumps(5),
    banner: () =>
      `M${m} 5 C${w / 3} 0 ${(2 * w) / 3} 10 ${w - m} 5 L${w - m} ${h - 5} C${(2 * w) / 3} ${h} ${w / 3} ${h - 10} ${m} ${h - 5} Z`,
    slant: () => `M7 ${m} L${w - m} ${m} L${w - 7} ${h - m} L${m} ${h - m} Z`,
    arrow: () => `M${m} ${m} L${w - 10} ${m} L${w - m} ${h / 2} L${w - 10} ${h - m} L${m} ${h - m} Z`,
    jagged: spikes,
    roof: () => `M${m} ${h - m} L${w / 2} ${m} L${w - m} ${h - m}`,
    arch: () => `M${m} ${h - m} Q${w / 2} ${-h + 2} ${w - m} ${h - m}`,
    canopy,
    bowl: () => `M${m} ${m} L5 ${h - m} H${w - 5} L${w - m} ${m}`,
    table: () => `M${m} ${h - m} L5 ${m} H${w - 5} L${w - m} ${h - m}`,
    castle: battlements,
  };

  return { d: paths[shape](), w, h };
};
