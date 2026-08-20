"use client";

import { useEffect, useRef } from "react";
import { on } from "@/lib/bus";
import { makeFbm } from "@/lib/noise";

/**
 * A topographic map of a terrain that doesn't exist — the classic
 * creative-coding pairing of fractal noise and MARCHING SQUARES.
 *
 * The post's name seeds a noise field (the "elevation"), marching squares
 * traces its isolines into contour rings, elevations get faint hypsometric
 * tints, and a few surveyor's labels sit in the margins. Drawn once, then
 * perfectly still: cartography, not spectacle. Every post is a different
 * mountain range.
 */

const BANDS = 12;
const INDEX_EVERY = 3; // every 3rd contour is an "index contour", like real maps

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function TerrainBg({ seed }: { seed: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const fbm = makeFbm("terrain:" + seed);
    const SCALE = 2.3; // how much terrain fits in view

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cs = getComputedStyle(document.body);
      const dark = document.documentElement.classList.contains("dark");
      const ink = cs.getPropertyValue("--ink").trim();
      const accent = cs.getPropertyValue("--accent").trim();
      const muted = cs.getPropertyValue("--muted").trim();
      const base = hexToRgb(cs.getPropertyValue(dark ? "--bg" : "--bg-soft").trim() || "#f4ede1");
      const tint = hexToRgb(accent || "#6d4aff");

      const aspect = w / h;
      const elev = (u: number, v: number) => fbm(u * SCALE * aspect, v * SCALE);

      // ---- hypsometric tinting: soft elevation shading, no hard pixels ----
      const gw = 160;
      const gh = Math.max(80, Math.round(160 / aspect));
      const off = document.createElement("canvas");
      off.width = gw;
      off.height = gh;
      const octx = off.getContext("2d")!;
      const img = octx.createImageData(gw, gh);
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const e = elev(x / gw, y / gh);
          const band = Math.floor(e * BANDS) / BANDS;
          const mix = band * (dark ? 0.30 : 0.16); // higher ground → more accent
          const i = (y * gw + x) * 4;
          img.data[i] = Math.round(lerp(base[0], tint[0], mix));
          img.data[i + 1] = Math.round(lerp(base[1], tint[1], mix));
          img.data[i + 2] = Math.round(lerp(base[2], tint[2], mix));
          img.data[i + 3] = 255;
        }
      }
      octx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(off, 0, 0, w, h);

      // ---- marching squares: trace each contour level ----
      const cols = Math.round(110 * Math.min(aspect, 1.9));
      const rows = Math.round(cols / aspect);
      const cw = w / cols;
      const ch = h / rows;
      const field: number[] = new Array((cols + 1) * (rows + 1));
      for (let y = 0; y <= rows; y++)
        for (let x = 0; x <= cols; x++) field[y * (cols + 1) + x] = elev(x / cols, y / rows);

      const labelSpots: { x: number; y: number; level: number }[] = [];

      for (let l = 1; l < BANDS; l++) {
        const iso = l / BANDS;
        const isIndex = l % INDEX_EVERY === 0;
        ctx.beginPath();
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
            // edge interpolation points
            const top = { x: x0 + t(tl, tr) * cw, y: y0 };
            const right = { x: x0 + cw, y: y0 + t(tr, br) * ch };
            const bottom = { x: x0 + t(bl, br) * cw, y: y0 + ch };
            const left = { x: x0, y: y0 + t(tl, bl) * ch };
            const seg = (p: { x: number; y: number }, q: { x: number; y: number }) => {
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
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
            // remember index-contour spots in the side margins for labels
            if (isIndex && (x0 < w * 0.16 || x0 > w * 0.84) && Math.random() < 0.004)
              labelSpots.push({ x: x0, y: y0, level: l });
          }
        }
        ctx.strokeStyle = isIndex ? accent : ink;
        ctx.globalAlpha = isIndex ? (dark ? 0.4 : 0.34) : (dark ? 0.2 : 0.16);
        ctx.lineWidth = isIndex ? 1.1 : 0.7;
        ctx.stroke();
      }

      // ---- a few surveyor's elevation labels, margins only ----
      ctx.globalAlpha = dark ? 0.4 : 0.35;
      ctx.fillStyle = muted;
      ctx.font = '10px "JetBrains Mono Variable", monospace';
      labelSpots.slice(0, 7).forEach((s) => {
        ctx.fillText(`${s.level * 100}`, s.x + 4, s.y - 4);
      });
      ctx.globalAlpha = 1;
    };

    render();
    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(render, 150);
    };
    window.addEventListener("resize", onResize);
    const offTheme = on("theme", () => setTimeout(render, 620));
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      offTheme();
    };
  }, [seed]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="terrain-mask pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0, transition: "opacity 1.2s ease" }}
    />
  );
}
