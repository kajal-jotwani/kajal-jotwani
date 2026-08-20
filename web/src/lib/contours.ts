import { makeFbm } from "@/lib/noise";

/**
 * Marching squares over a seeded noise field, emitted as SVG path strings.
 * Used by the blog post share card so a shared link shows that post's own
 * terrain — the same map the page itself draws.
 */
export function contourPaths(
  seed: string,
  width: number,
  height: number,
  bands = 11,
): { d: string; index: boolean }[] {
  const fbm = makeFbm("terrain:" + seed);
  const aspect = width / height;
  const SCALE = 2.3;
  const cols = 120;
  const rows = Math.round(cols / aspect);
  const cw = width / cols;
  const ch = height / rows;

  const field: number[] = new Array((cols + 1) * (rows + 1));
  for (let y = 0; y <= rows; y++)
    for (let x = 0; x <= cols; x++)
      field[y * (cols + 1) + x] = fbm((x / cols) * SCALE * aspect, (y / rows) * SCALE);

  const out: { d: string; index: boolean }[] = [];
  for (let l = 1; l < bands; l++) {
    const iso = l / bands;
    let d = "";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tl = field[y * (cols + 1) + x];
        const tr = field[y * (cols + 1) + x + 1];
        const br = field[(y + 1) * (cols + 1) + x + 1];
        const bl = field[(y + 1) * (cols + 1) + x];
        const idx =
          (tl > iso ? 8 : 0) | (tr > iso ? 4 : 0) | (br > iso ? 2 : 0) | (bl > iso ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x0 = x * cw;
        const y0 = y * ch;
        const t = (a: number, b: number) => (iso - a) / (b - a || 1e-9);
        const top = [x0 + t(tl, tr) * cw, y0];
        const right = [x0 + cw, y0 + t(tr, br) * ch];
        const bottom = [x0 + t(bl, br) * cw, y0 + ch];
        const left = [x0, y0 + t(tl, bl) * ch];
        const seg = (p: number[], q: number[]) => {
          d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
        };
        switch (idx) {
          case 1: case 14: seg(left, bottom); break;
          case 2: case 13: seg(bottom, right); break;
          case 3: case 12: seg(left, right); break;
          case 4: case 11: seg(top, right); break;
          case 5: seg(top, left); seg(bottom, right); break;
          case 6: case 9: seg(top, bottom); break;
          case 7: case 8: seg(top, left); break;
          case 10: seg(top, right); seg(left, bottom); break;
        }
      }
    }
    if (d) out.push({ d, index: l % 3 === 0 });
  }
  return out;
}
