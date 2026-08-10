"use client";

import { useEffect, useRef } from "react";
import { state, on } from "@/lib/bus";

/** Fixed full-viewport canvas drawing a few slow sine ribbons — the page's
 *  "score". Amplitude reacts to scroll velocity; breathes more with sound on.
 *  Deliberately faint so it reads as texture, not decoration. */
export default function WaveformBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t = 0;
    let colors = ["#6d4aff", "#e0407f", "#1d9e6e"];
    let waveOpacity = 0.5;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const readTheme = () => {
      const cs = getComputedStyle(document.body);
      colors = [
        cs.getPropertyValue("--accent").trim() || colors[0],
        cs.getPropertyValue("--pink").trim() || colors[1],
        cs.getPropertyValue("--green").trim() || colors[2],
      ];
      waveOpacity = parseFloat(cs.getPropertyValue("--wave-opacity")) || 0.5;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const vel = Math.min(Math.abs(state.scrollVelocity), 50);
      const energy = 1 + vel / 14 + (state.soundOn ? 0.6 : 0);

      for (let r = 0; r < 3; r++) {
        const baseY = h * (0.25 + r * 0.25);
        const amp = (14 + r * 9) * energy;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y =
            baseY +
            Math.sin(x * 0.0042 + t * (0.4 + r * 0.13) + r * 2.1) * amp +
            Math.sin(x * 0.011 - t * 0.22 + r) * amp * 0.35 +
            Math.sin(x * 0.0013 + t * 0.11) * amp * 0.5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colors[r];
        ctx.globalAlpha = 0.05 * waveOpacity * (3 - r * 0.6);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      t += 0.012 + Math.min(Math.abs(state.scrollVelocity), 40) * 0.0009;
      draw();
      raf = requestAnimationFrame(loop);
    };

    readTheme();
    resize();
    window.addEventListener("resize", resize);
    const offTheme = on("theme", () => setTimeout(readTheme, 650));

    if (reduced) {
      draw(); // one calm static frame
    } else {
      raf = requestAnimationFrame(loop);
      const vis = () => {
        cancelAnimationFrame(raf);
        if (!document.hidden) raf = requestAnimationFrame(loop);
      };
      document.addEventListener("visibilitychange", vis);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", vis);
        offTheme();
      };
    }
    return () => {
      window.removeEventListener("resize", resize);
      offTheme();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
