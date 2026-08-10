"use client";

import { useEffect, useRef } from "react";
import { state, on } from "@/lib/bus";
import { seededRng } from "@/lib/seeded";

/**
 * Generative art background: a flow field.
 * A grid of invisible angles (value noise) steers hundreds of particles;
 * their trails paint the canvas — the classic p5.js technique, hand-coded
 * on raw canvas for a near-zero bundle. Faint by design: art as texture.
 * Scrolling adds wind. Reduced-motion gets one calm, pre-simulated frame.
 */

// --- tiny seeded value-noise (smooth, tileable enough) ---
function makeNoise(seed: string) {
  const rng = seededRng(seed);
  const N = 64;
  const grid: number[] = Array.from({ length: N * N }, () => rng());
  const sm = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number): number => {
    const xi = Math.floor(x) & (N - 1);
    const yi = Math.floor(y) & (N - 1);
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const a = grid[yi * N + xi];
    const b = grid[yi * N + ((xi + 1) & (N - 1))];
    const c = grid[((yi + 1) & (N - 1)) * N + xi];
    const d = grid[((yi + 1) & (N - 1)) * N + ((xi + 1) & (N - 1))];
    const u = sm(xf);
    const v = sm(yf);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  };
}

interface P {
  x: number;
  y: number;
  px: number;
  py: number;
  life: number;
  c: number;
}

export default function ArtBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const noise = makeNoise("kajal");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = 0;
    let colors = ["#6d4aff", "#e0407f", "#1d9e6e"];
    let alpha = 0.1;
    let w = 0;
    let h = 0;

    const readTheme = () => {
      const cs = getComputedStyle(document.body);
      colors = [
        cs.getPropertyValue("--accent").trim() || colors[0],
        cs.getPropertyValue("--pink").trim() || colors[1],
        cs.getPropertyValue("--green").trim() || colors[2],
      ];
      alpha = document.documentElement.classList.contains("dark") ? 0.14 : 0.1;
      ctx.clearRect(0, 0, w, h);
    };

    const rng = seededRng("particles");
    const count = window.innerWidth < 768 ? 110 : 240;
    const ps: P[] = [];
    const spawn = (p?: P): P => {
      const q: P = p ?? ({} as P);
      q.x = rng() * (w || window.innerWidth);
      q.y = rng() * (h || window.innerHeight);
      q.px = q.x;
      q.py = q.y;
      q.life = 60 + rng() * 160;
      q.c = Math.floor(rng() * 3);
      return q;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
    };
    resize();
    for (let i = 0; i < count; i++) ps.push(spawn());

    const stepParticles = (speed: number, fade: number) => {
      // gently erase old trails
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      for (const p of ps) {
        const n = noise(p.x * 0.004 + t * 0.06, p.y * 0.004 - t * 0.04);
        const a = n * Math.PI * 4 + t * 0.12;
        p.px = p.x;
        p.py = p.y;
        p.x += Math.cos(a) * speed;
        p.y += Math.sin(a) * speed + speed * 0.15; // slight downward drift, like rain of ink
        p.life--;
        if (p.life <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          spawn(p);
          continue;
        }
        ctx.strokeStyle = colors[p.c];
        ctx.globalAlpha = alpha * Math.min(1, p.life / 40);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      const vel = Math.min(Math.abs(state.scrollVelocity), 40);
      t += 0.016;
      stepParticles(1.1 + vel * 0.05, 0.045);
      raf = requestAnimationFrame(loop);
    };

    readTheme();
    const offTheme = on("theme", () => setTimeout(readTheme, 650));

    if (reduced) {
      // one calm frame: simulate ~200 steps without animating
      for (let i = 0; i < 200; i++) {
        t += 0.016;
        stepParticles(1.1, 0.02);
      }
    } else {
      raf = requestAnimationFrame(loop);
    }

    const vis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("resize", resize);
      offTheme();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
