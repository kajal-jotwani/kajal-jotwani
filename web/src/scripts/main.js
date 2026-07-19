/*
 * main.js — boot, theme, lazy-load, and the event bus.
 *
 * The bus is the clean backbone every module talks through. It's attached to
 * `window.bus` so the Canvas/audio modules that lazy-load in later stages can
 * subscribe without a bundler import cycle:
 *
 *   bus.on('theme:change', cb)   bus.emit('theme:change', { theme })
 *   bus.on('play', cb)           bus.emit('play')
 *
 * Theme: localStorage wins → else prefers-color-scheme → else dark.
 * A tiny inline script in <head> sets data-theme before first paint to avoid
 * a flash; this module owns the toggle, persistence, and theme:change events.
 */

/* ------------------------------------------------------------------ bus */

class EventBus {
  constructor() {
    this._map = new Map();
  }
  on(event, cb) {
    const set = this._map.get(event) ?? new Set();
    set.add(cb);
    this._map.set(event, set);
    return () => this.off(event, cb);
  }
  once(event, cb) {
    const off = this.on(event, (payload) => {
      off();
      cb(payload);
    });
    return off;
  }
  off(event, cb) {
    this._map.get(event)?.delete(cb);
  }
  emit(event, payload) {
    this._map.get(event)?.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[bus] handler for "${event}" threw`, err);
      }
    });
  }
}

const bus = new EventBus();
window.bus = bus;

/* --------------------------------------------------------------- theme */

const STORAGE_KEY = "kj-theme";
const THEMES = ["dark", "light"];

function preferredScheme() {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function storedTheme() {
  const v = localStorage.getItem(STORAGE_KEY);
  return THEMES.includes(v) ? v : null;
}

function applyTheme(theme, { persist = true, announce = true } = {}) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  if (persist) localStorage.setItem(STORAGE_KEY, theme);
  syncToggles(theme);
  if (announce) bus.emit("theme:change", { theme });
}

function toggleTheme() {
  const current =
    document.documentElement.getAttribute("data-theme") ?? "dark";
  applyTheme(current === "dark" ? "light" : "dark");
}

function syncToggles(theme) {
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(theme === "light"));
    btn.dataset.theme = theme;
  });
}

function initTheme() {
  // The inline head script already set data-theme to avoid a flash; if it
  // didn't run (no-JS), fall back to stored → preferred → dark.
  const initial =
    document.documentElement.getAttribute("data-theme") ||
    storedTheme() ||
    preferredScheme();
  applyTheme(initial, { persist: false, announce: false });
  syncToggles(initial);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
  });

  // Follow the OS preference, but only while the user hasn't chosen.
  window.matchMedia?.("(prefers-color-scheme: light)").addEventListener(
    "change",
    (e) => {
      if (storedTheme()) return; // user has chosen — respect it
      applyTheme(e.matches ? "light" : "dark", { persist: false });
    },
  );
}

/* ---------------------------------------------------------------- boot */

function boot() {
  initTheme();
  // Later stages lazy-load sequencer / audio / cursor / background here,
  // gated behind their own triggers (Play click, idle, etc.).
  bus.emit("boot");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

export { bus };