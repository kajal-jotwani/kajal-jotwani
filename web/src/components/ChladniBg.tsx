"use client";

import { useEffect, useRef } from "react";
import { on } from "@/lib/bus";
import { seededRng } from "@/lib/seeded";
import { vibration, type ChladniParams } from "@/lib/chladni";

/**
 * Renders the post's Chladni figure fully settled and perfectly STILL.
 * The sand simulation runs instantly at mount (a few thousand grains
 * annealing onto the nodal lines), the finished figure fades in once,
 * and then nothing on this page ever moves — motion behind text is
 * hostile to readers, especially ADHD and vestibular-sensitive ones.
 * The art is the pattern, not the performance.
 *
 * The .blog-art-mask keeps the text column clear; the figure lives in
 * the margins.
 */
export default function ChladniBg({ params }: { params: ChladniParams }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;

    const STEPS = 320;
    let w = 0;
    let h = 0;
    let colA = "#6d4aff";
    let colB = "#e0407f";
    let alpha = 0.55;
    let dark = false;

    const COUNT = typeof window !== "undefined" && window.innerWidth < 768 ? 2400 : 6000;
    const gx = new Float32Array(COUNT);
    const gy = new Float32Array(COUNT);
    const gb = new Uint8Array(COUNT);

    const readTheme = () => {
      const cs = getComputedStyle(document.body);
      const vars = ["--accent", "--pink", "--green"];
      colA = cs.getPropertyValue(vars[params.hueA % 3]).trim() || colA;
      colB = cs.getPropertyValue(vars[params.hueB % 3]).trim() || colB;
      dark = document.documentElement.classList.contains("dark");
      alpha = dark ? 0.6 : 0.55;
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** run the whole annealing synchronously — grains leap where the plate
     *  is loud, settle where it is silent; nobody sees the intermediate
     *  states, only the finished figure */
    const solve = () => {
      const rng = seededRng("sand:" + params.n + ":" + params.m);
      for (let i = 0; i < COUNT; i++) {
        gx[i] = rng();
        gy[i] = rng();
        gb[i] = rng() < 0.28 ? 1 : 0;
      }
      for (let f = 0; f < STEPS; f++) {
        const k = 0.05 * Math.pow(1 - f / STEPS, 1.6) + 0.00018;
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
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // faint glow pass — sand under soft light
      ctx.globalAlpha = dark ? 0.08 : 0.05;
      for (let i = 0; i < COUNT; i++) {
        ctx.fillStyle = gb[i] ? colB : colA;
        ctx.fillRect(gx[i] * w - 1.5, gy[i] * h - 1.5, 4, 4);
      }
      ctx.globalAlpha = alpha;
      for (let i = 0; i < COUNT; i++) {
        ctx.fillStyle = gb[i] ? colB : colA;
        ctx.fillRect(gx[i] * w, gy[i] * h, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;
    };

    readTheme();
    layout();
    solve();
    draw();
    // one gentle fade-in of a still image, then permanence
    requestAnimationFrame(() => {
      canvas.style.opacity = dark ? "0.4" : "0.45";
    });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        layout();
        solve();
        draw();
      }, 150);
    };
    const offTheme = on("theme", () =>
      setTimeout(() => {
        readTheme();
        draw();
        canvas.style.opacity = dark ? "0.4" : "0.45";
      }, 620)
    );
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      offTheme();
    };
  }, [params]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="blog-art-mask pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0, transition: "opacity 1.4s ease" }}
    />
  );
}
