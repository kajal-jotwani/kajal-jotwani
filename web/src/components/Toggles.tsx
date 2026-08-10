"use client";

import { useEffect, useState } from "react";
import { emit } from "@/lib/bus";
import { getEngine } from "@/lib/audio-engine";

export function SoundToggle() {
  const [onState, setOnState] = useState(false);

  const toggle = () => {
    const engine = getEngine();
    if (onState) {
      engine.stop();
      setOnState(false);
    } else {
      engine.start();
      engine.plink(4, 0.8);
      setOnState(true);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={onState}
      aria-label={onState ? "turn sound off" : "turn sound on — the page becomes an instrument"}
      title={onState ? "sound off" : "make the page sing"}
      className={`group flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors ${
        onState
          ? "border-accent bg-accent-soft text-accent"
          : "border-line text-muted hover:border-line-strong hover:text-ink"
      }`}
    >
      <span className={onState ? "spinning inline-block" : "inline-block"}>♪</span>
    </button>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("kj-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
    emit("theme");
    emit("plink", next ? 2 : 6);
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "switch to daylight" : "switch to late night"}
      title={dark ? "daylight" : "late night"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-sm text-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      {dark ? "☾" : "☀"}
    </button>
  );
}
