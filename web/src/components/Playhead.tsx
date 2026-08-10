"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/content";
import { state } from "@/lib/bus";

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** The scroll bar is a playhead: a thin progress line up top and a
 *  timecode that treats the page as a song. */
export default function Playhead() {
  const [progress, setProgress] = useState(0);
  const lastY = useRef(0);
  const velRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));

    const tick = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      // smoothed velocity for the audio filter + waveform amplitude
      velRef.current = velRef.current * 0.88 + (y - lastY.current) * 0.12;
      lastY.current = y;
      state.scrollVelocity = velRef.current;
      state.scrollProgress = p;

      // which "track" are we on?
      const marker = y + window.innerHeight * 0.38;
      let idx = 0;
      sections().forEach((el, i) => {
        if (el.offsetTop <= marker) idx = i;
      });
      state.sectionIndex = idx;

      setProgress(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const duration = site.meta.songDurationSeconds;
  const t = progress * duration;

  return (
    <>
      {/* progress line */}
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
        <div
          className="h-full origin-left bg-gradient-to-r from-accent via-pink to-green"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      {/* timecode chip */}
      <div
        aria-hidden
        className="font-mono fixed bottom-4 right-4 z-40 hidden select-none rounded-full border border-line bg-bg-card/80 px-3 py-1.5 text-[11px] tracking-wider text-muted backdrop-blur-sm sm:block"
      >
        <span className="text-accent blink">▸</span> {fmt(t)}{" "}
        <span className="opacity-50">/ {fmt(duration)}</span>
      </div>
    </>
  );
}
