"use client";

import { useEffect, useRef } from "react";
import { on } from "@/lib/bus";
import { seededRng } from "@/lib/seeded";
import { vibration, type ChladniParams } from "@/lib/chladni";

/**
 * Simulates the sand: thousands of grains start scattered, and every frame
 * each grain jumps with an amplitude proportional to how hard the plate
 * vibrates beneath it. Where the plate is loud, sand flies; where it is
 * silent, sand stays. Over ~6 seconds the noise anneals into the figure —
 * then everything goes still so the page is calm while you read.
 *
 * The .blog-art-mask keeps the text column clear; the figure lives in the
 * margins and behind the whitespace.
 */
export default function ChladniBg({ params }: { params: ChladniParams }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const FRAMES = 380;
    let raf = 0;
    let frame = 0;
    let w = 0;
    let h = 0;
    let colA = "#6d4aff";
    let colB = "#e0407f";
    let alpha = 0.55;
    let dark = false;

    const rng = seededRng("sand:" + params.n + ":" + params.m);
    const COUNT = typeof window !== "undefined" && window.innerWidth < 768 ? 3200 : 9000;
    const gx = new Float32Array(COUNT);
    const gy = new Float32Array(COUNT);
    const gb = new Uint8Array(COUNT); // 1 = accent-coloured grain
    for (let i = 0; i < COUNT; i++) {
      gx[i] = rng();
      gy[i] = rng();
      gb[i] = rng() < 0.28 ? 1 : 0;
    }

    const readTheme = () => {
      const cs = getComputedStyle(document.body);
      const vars = ["--accent", "--pink", "--green"];
      colA = cs.getPropertyValue(vars[params.hueA % 3]).trim() || colA;
      colB = cs.getPropertyValue(vars[params.hueB % 3]).trim() || colB;
      dark = document.documentElement.classList.contains("dark");
      alpha = dark ? 0.8 : 0.68;
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** one physics step: grains jump where the plate is loud */
    const step = (annealing: number) => {
      const k = 0.05 * Math.pow(annealing, 1.6) + 0.00018;
      for (let i = 0; i < COUNT; i++) {
        const v = Math.abs(vibration(params, gx[i], gy[i]));
        const jump = k * v;
        gx[i] += (rng() - 0.5) * jump;
        gy[i] += (rng() - 0.5) * jump;
        if (gx[i] < 0) gx[i] = -gx[i];
        if (gx[i] > 1) gx[i] = 2 - gx[i];
        if (gy[i] < 0) gy[i] = -gy[i];
        if (gy[i] > 1) gy[i] = 2 - gy[i];
      }
    };

    const draw = (final: boolean) => {
      ctx.clearRect(0, 0, w, h);
      // settled grains get a soft glow pass — sand under stage light
      if (final) {
        ctx.globalAlpha = dark ? 0.16 : 0.1;
        for (let i = 0; i < COUNT; i++) {
          ctx.fillStyle = gb[i] ? colB : colA;
          ctx.fillRect(gx[i] * w - 2.5, gy[i] * h - 2.5, 6, 6);
        }
      }
      ctx.globalAlpha = alpha;
      for (let i = 0; i < COUNT; i++) {
        ctx.fillStyle = gb[i] ? colB : colA;
        ctx.fillRect(gx[i] * w, gy[i] * h, 1.7, 1.7);
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      const annealing = 1 - frame / FRAMES;
      step(annealing);
      const final = frame >= FRAMES - 1;
      draw(final);
      frame++;
      if (!final) raf = requestAnimationFrame(loop);
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      layout();
      readTheme();
      if (reduced || frame >= FRAMES) {
        // no animation: settle instantly and show the finished figure
        for (let f = frame; f < FRAMES; f++) step(1 - f / FRAMES);
        frame = FRAMES;
        draw(true);
      } else {
        raf = requestAnimationFrame(loop);
      }
    };

    restart();

    const onResize = () => {
      layout();
      draw(frame >= FRAMES);
    };
    const offTheme = on("theme", () =>
      setTimeout(() => {
        readTheme();
        draw(frame >= FRAMES);
      }, 620)
    );
    window.addEventListener("resize", onResize);
    const vis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (frame < FRAMES && !reduced) raf = requestAnimationFrame(loop);
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
      className="blog-art-mask pointer-events-none fixed inset-0 -z-10"
    />
  );
}
