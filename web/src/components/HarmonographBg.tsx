"use client";

import { useEffect, useRef } from "react";
import { on } from "@/lib/bus";
import { penAt, type Harmonograph } from "@/lib/harmonograph";

/**
 * Draws the post's harmonograph slowly, like ink being laid down, then stops.
 * Motion that *finishes* — so it's alive when you arrive and still while you read.
 *
 * Readability is handled by a CSS mask (.harmonograph-mask) that carves the
 * text column out of the middle, so the drawing only ever lives in the margins.
 */
export default function HarmonographBg({ params }: { params: Harmonograph }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DT = 0.02;
    const T_MAX = 620;
    const PER_FRAME = 80;

    let raf = 0;
    let t = 0;
    let ink = "#6d4aff";
    let alpha = 0.5;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let radius = 0;
    let last: [number, number] | null = null;

    const readTheme = () => {
      const cs = getComputedStyle(document.body);
      const vars = ["--accent", "--pink", "--green"];
      ink = cs.getPropertyValue(vars[params.hue % 3]).trim() || ink;
      const dark = document.documentElement.classList.contains("dark");
      alpha = dark ? 0.62 : 0.58;
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h * 0.45;
      // big enough to reach well past the text column into both margins
      radius = Math.max(w, h) * 0.46;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const segment = () => {
      const [px, py, env] = penAt(params, t);
      const x = cx + px * radius;
      const y = cy + py * radius;
      if (last) {
        ctx.strokeStyle = ink;
        // the tail fades as the pendulums wind down
        ctx.globalAlpha = alpha * (0.18 + 0.82 * env);
        ctx.lineWidth = 0.95;
        ctx.beginPath();
        ctx.moveTo(last[0], last[1]);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      last = [x, y];
      t += DT;
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      layout();
      readTheme();
      ctx.clearRect(0, 0, w, h);
      t = 0;
      last = null;
      if (reduced) {
        while (t < T_MAX) segment(); // one finished drawing, no animation
        ctx.globalAlpha = 1;
      } else {
        raf = requestAnimationFrame(loop);
      }
    };

    const loop = () => {
      for (let i = 0; i < PER_FRAME && t < T_MAX; i++) segment();
      ctx.globalAlpha = 1;
      if (t < T_MAX) raf = requestAnimationFrame(loop);
    };

    restart();

    const onResize = () => restart();
    const offTheme = on("theme", () => setTimeout(restart, 620));
    window.addEventListener("resize", onResize);

    const vis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (t < T_MAX && !reduced) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", vis);
      offTheme();
    };
  }, [params]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="harmonograph-mask pointer-events-none fixed inset-0 -z-10"
    />
  );
}
