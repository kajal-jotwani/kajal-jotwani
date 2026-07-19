/*
 * sequencer.js — the piano-roll canvas engine (visual + interaction, NO audio).
 *
 * One class instance per [data-sequencer]. Lazy-inits when scrolled into view
 * (IntersectionObserver, mirroring Astro's client:visible) so first paint stays
 * fast. Geometry comes straight from the build-time loader's pre-computed
 * left%/width%/subRow — the same numbers the static DOM used, so the two stay
 * in lockstep.
 *
 * Talks to the world only through the bus: emits entry:click + playhead:tick,
 * listens theme:change. Audio (Stage 4) subscribes to playhead:tick elsewhere.
 */

const GUTTER = 96; // lane-label column, CSS px (shrinks on narrow screens)
const AXIS_H = 30;
const ROW_H = 64;
const ROW_GAP = 8;
const BLOCK_R = 9;
const PLAY_MS_PER_YEAR = 1300; // playhead sweep speed

export function initSequencer(root) {
  if (!root || root._sequencer) return;
  root._sequencer = new Sequencer(root);
}

class Sequencer {
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector("[data-stage]");
    this.canvas = root.querySelector("canvas");
    this.playBtn = root.querySelector("[data-play]");
    this.srLive = root.querySelector("[data-sr-live]");
    this.dataEl = root.querySelector("[data-sequencer-data]");

    this.ctx = this.canvas.getContext("2d");
    this.data = JSON.parse(this.dataEl.textContent);
    this.lanes = this.data.lanes;
    this.axis = this.data.axis;

    // Flat, logically-ordered entry list for keyboard nav + hit-testing.
    this.flat = [];
    this.lanes.forEach((lane, li) => {
      const sorted = [...lane.entries].sort(
        (a, b) => a.start - b.start || a._subRow - b._subRow,
      );
      sorted.forEach((e) => this.flat.push({ ...e, _laneIndex: li, _flat: this.flat.length }));
    });

    this.hoveredId = null;
    this.focusIndex = -1;
    this.pulses = new Map(); // id -> 0..1
    this.triggered = new Set();
    this.playing = false;
    this.progress = 0;
    this.startT = 0;
    this.duration = Math.max(4000, this.axis.span * PLAY_MS_PER_YEAR);
    this.rects = []; // {entry, x, y, w, h, lane}
    this.raf = 0;

    this.colors = {};
    this.w = 0;
    this.h = 0;
    this.dpr = 1;

    this._lazyInit();
  }

  /* ----------------------------------------------------------- lifecycle */

  _lazyInit() {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.mount();
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(this.stage);
  }

  mount() {
    this.readTheme();
    this.resize();
    this.draw();

    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.stage);
    this._ro = ro;

    this.stage.addEventListener("pointermove", (e) => this.onPointerMove(e));
    this.stage.addEventListener("pointerleave", () => {
      if (this.hoveredId !== null) {
        this.hoveredId = null;
        this.requestDraw();
      }
    });
    this.stage.addEventListener("click", (e) => this.onClick(e));
    this.stage.addEventListener("keydown", (e) => this.onKey(e));
    this.stage.addEventListener("focus", () => {
      if (this.focusIndex === -1 && this.flat.length) {
        this.focusIndex = 0;
        this.announceFocus();
        this.requestDraw();
      }
    });

    this.playBtn.addEventListener("click", () => this.togglePlay());

    window.bus.on("theme:change", () => {
      this.readTheme();
      this.requestDraw();
    });

    // If the stage is already in view on mount (e.g. no scroll), make sure it's
    // focusable/clickable immediately.
    this.stage.dataset.ready = "true";
  }

  /* ------------------------------------------------------------- theme */

  readTheme() {
    const css = getComputedStyle(document.documentElement);
    const v = (n) => css.getPropertyValue(n).trim();
    this.colors = {
      bg: v("--bg"),
      surface: v("--surface"),
      border: v("--border"),
      borderStrong: v("--border-strong"),
      fg: v("--fg"),
      fgDim: v("--fg-dim"),
      muted: v("--muted"),
      accent: v("--accent"),
      lanes: [1, 2, 3, 4].map((i) => v(`--lane-${i}`)),
    };
  }

  /* ----------------------------------------------------------- sizing */

  resize() {
    const host = this.stage;
    const cssW = host.clientWidth;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.gutter = cssW < 560 ? 64 : GUTTER;
    this.trackW = cssW - this.gutter;

    // Height: axis + each lane's stacked sub-rows.
    let h = AXIS_H;
    for (const lane of this.lanes) h += (lane.subRows || 1) * (ROW_H + ROW_GAP);
    h += 8;
    this.w = cssW;
    this.h = h;

    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = cssW + "px";
    this.canvas.style.height = h + "px";

    this.computeRects();
    this.requestDraw();
  }

  computeRects() {
    this.rects = [];
    const x0 = this.gutter;
    let laneTop = AXIS_H;
    this.lanes.forEach((lane, li) => {
      const subRows = lane.subRows || 1;
      lane.entries.forEach((e) => {
        const x = x0 + (e._leftPct / 100) * this.trackW;
        const w = Math.max((e._widthPct / 100) * this.trackW, 22);
        const y = laneTop + e._subRow * (ROW_H + ROW_GAP);
        this.rects.push({ entry: e, x, y, w, h: ROW_H, laneIndex: li });
      });
      laneTop += subRows * (ROW_H + ROW_GAP);
    });
  }

  /* ------------------------------------------------------------- draw */

  requestDraw() {
    if (this.raf || this.playing) return; // loop already pending
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw();
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const c = this.colors;

    // Year axis
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = c.muted;
    const baseY = AXIS_H - 1;
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.gutter, baseY);
    ctx.lineTo(this.w, baseY);
    ctx.stroke();
    for (const y of this.axis.ticks) {
      const x = this.gutter + (this.axis.tickPct(y) / 100) * this.trackW;
      ctx.fillStyle = c.muted;
      ctx.fillText(String(y), x, 4);
      ctx.strokeStyle = c.border;
      ctx.beginPath();
      ctx.moveTo(x, baseY - 4);
      ctx.lineTo(x, baseY);
      ctx.stroke();
    }

    // Lane labels + guide rows
    ctx.textAlign = "left";
    let laneTop = AXIS_H;
    this.lanes.forEach((lane, li) => {
      const subRows = lane.subRows || 1;
      const color = c.lanes[li % 4];
      ctx.fillStyle = c.fg;
      ctx.font = "600 13px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(lane.label, 0, laneTop + 2);
      ctx.fillStyle = color;
      ctx.font = "600 9px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(lane.instrument.toUpperCase(), 0, laneTop + 20);

      // faint row guides
      ctx.strokeStyle = c.border;
      for (let r = 0; r < subRows; r++) {
        const gy = laneTop + r * (ROW_H + ROW_GAP) + ROW_H + 2;
        ctx.beginPath();
        ctx.moveTo(this.gutter, gy);
        ctx.lineTo(this.w, gy);
        ctx.stroke();
      }
      laneTop += subRows * (ROW_H + ROW_GAP);
    });

    // Blocks
    const focusId =
      this.focusIndex >= 0 ? this.flat[this.focusIndex]?.id : null;
    for (const r of this.rects) {
      const isHover = r.entry.id === this.hoveredId;
      const isFocus = r.entry.id === focusId;
      const pulse = this.pulses.get(r.entry.id) ?? 0;
      this.drawBlock(r, { isHover, isFocus, pulse });
    }

    // Playhead
    if (this.progress > 0 || this.playing) {
      const px = this.gutter + this.progress * this.trackW;
      ctx.save();
      ctx.fillStyle = c.accent;
      ctx.shadowColor = c.accent;
      ctx.shadowBlur = 10;
      ctx.fillRect(px - 1, AXIS_H - 2, 2, this.h - AXIS_H);
      ctx.restore();
      // playhead head cap
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.moveTo(px, AXIS_H - 2);
      ctx.lineTo(px - 5, AXIS_H - 9);
      ctx.lineTo(px + 5, AXIS_H - 9);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawBlock(r, { isHover, isFocus, pulse }) {
    const ctx = this.ctx;
    const c = this.colors;
    const laneColor = c.lanes[r.laneIndex % 4];
    let x = r.x;
    let y = r.y;
    let w = r.w;
    let h = r.h;
    if (isHover || pulse > 0) {
      const lift = isHover ? 2 : 0;
      const grow = pulse > 0 ? pulse * 1.5 : 0;
      y -= lift;
      x -= grow;
      w += grow * 2;
    }

    // glow on hover / pulse
    if (isHover || pulse > 0) {
      ctx.save();
      ctx.shadowColor = laneColor;
      ctx.shadowBlur = isHover ? 16 : 8 + pulse * 18;
      this.roundRect(x, y, w, h, BLOCK_R);
      ctx.fillStyle = this.tint(laneColor, 0.16, c.surface);
      ctx.fill();
      ctx.restore();
    } else {
      this.roundRect(x, y, w, h, BLOCK_R);
      ctx.fillStyle = this.tint(laneColor, 0.12, c.surface);
      ctx.fill();
    }

    // left accent bar
    ctx.fillStyle = laneColor;
    this.roundRect(x, y, 3, h, BLOCK_R);
    ctx.fill();

    // border
    ctx.strokeStyle = isHover || pulse > 0 ? laneColor : this.tint(laneColor, 0.4, c.border);
    ctx.lineWidth = 1;
    this.roundRect(x, y, w, h, BLOCK_R);
    ctx.stroke();

    // focus ring (keyboard)
    if (isFocus) {
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      this.roundRect(x - 3, y - 3, w + 6, h + 6, BLOCK_R + 3);
      ctx.stroke();
    }

    // text (clipped to block)
    ctx.save();
    this.roundRect(x, y, w, h, BLOCK_R);
    ctx.clip();
    ctx.textBaseline = "top";
    ctx.fillStyle = c.fg;
    ctx.font = "600 13px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(this.fit(r.entry.title, w - 18), x + 9, y + 8);
    if (r.entry.org && w > 60) {
      ctx.fillStyle = c.muted;
      ctx.font = "500 10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(this.fit(r.entry.org, w - 18), x + 9, y + 25);
    }
    ctx.restore();
  }

  /* --------------------------------------------------------- helpers */

  roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // Mix a CSS color with another by alpha (color-mix fallback for canvas).
  tint(color, alpha, base) {
    return this._withAlpha(color, alpha, base);
  }

  _withAlpha(color, alpha, base) {
    const rgb = this._parseColor(color);
    if (!rgb) return base;
    const b = this._parseColor(base) || { r: 0, g: 0, b: 0 };
    const r = Math.round(rgb.r * alpha + b.r * (1 - alpha));
    const g = Math.round(rgb.g * alpha + b.g * (1 - alpha));
    const bl = Math.round(rgb.b * alpha + b.b * (1 - alpha));
    return `rgb(${r}, ${g}, ${bl})`;
  }

  _parseColor(v) {
    if (!v) return null;
    v = v.trim();
    if (v.startsWith("#")) {
      const h = v.slice(1);
      const full =
        h.length === 3
          ? h.split("").map((x) => x + x).join("")
          : h;
      if (full.length === 6) {
        return {
          r: parseInt(full.slice(0, 2), 16),
          g: parseInt(full.slice(2, 4), 16),
          b: parseInt(full.slice(4, 6), 16),
        };
      }
    }
    const m = v.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b] = m[1].split(",").map((x) => parseFloat(x));
      return { r, g, b };
    }
    const hm = v.match(/hsla?\(([^)]+)\)/);
    if (hm) {
      const [h, s, l] = hm[1].split(",").map((x) => parseFloat(x));
      return this._hslToRgb(h, s, l);
    }
    return null;
  }

  _hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
      r: Math.round(255 * f(0)),
      g: Math.round(255 * f(8)),
      b: Math.round(255 * f(4)),
    };
  }

  fit(text, maxW) {
    if (maxW <= 0) return "";
    this.ctx.font = this.ctx.font; // keep current
    let t = text;
    const m = this.ctx.measureText(t).width;
    if (m <= maxW) return t;
    while (t.length > 1 && this.ctx.measureText(t + "…").width > maxW) {
      t = t.slice(0, -1);
    }
    return t + "…";
  }

  hitTest(px, py) {
    for (const r of this.rects) {
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h)
        return r;
    }
    return null;
  }

  toLocal(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  /* ------------------------------------------------------- pointers */

  onPointerMove(e) {
    const { x, y } = this.toLocal(e);
    const r = this.hitTest(x, y);
    const id = r ? r.entry.id : null;
    if (id !== this.hoveredId) {
      this.hoveredId = id;
      this.stage.style.cursor = id ? "pointer" : "default";
      this.requestDraw();
    }
  }

  onClick(e) {
    const { x, y } = this.toLocal(e);
    const r = this.hitTest(x, y);
    if (!r) return;
    this.focusIndex = this.flat.findIndex((f) => f.id === r.entry.id);
    this.requestDraw();
    window.bus.emit("entry:click", this.publicEntry(r.entry));
  }

  publicEntry(e) {
    const lane = this.lanes.find((l) => l.id === e.lane) || {};
    return {
      id: e.id,
      title: e.title,
      org: e.org,
      summary: e.summary,
      tags: e.tags,
      links: e.links,
      detailHtml: e.detailHtml,
      start: e.start,
      end: e.end,
      laneLabel: lane.label,
      instrument: lane.instrument,
    };
  }

  /* -------------------------------------------------------- keyboard */

  onKey(e) {
    const n = this.flat.length;
    if (!n) return;
    const key = e.key;
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End", "Enter", " "].includes(key)) {
      e.preventDefault();
    }
    if (key === "ArrowRight" || key === "ArrowDown") {
      this.focusIndex = this.focusIndex < 0 ? 0 : Math.min(n - 1, this.focusIndex + 1);
    } else if (key === "ArrowLeft" || key === "ArrowUp") {
      this.focusIndex = this.focusIndex < 0 ? 0 : Math.max(0, this.focusIndex - 1);
    } else if (key === "Home") {
      this.focusIndex = 0;
    } else if (key === "End") {
      this.focusIndex = n - 1;
    } else if (key === "Enter" || key === " ") {
      if (this.focusIndex >= 0)
        window.bus.emit("entry:click", this.publicEntry(this.flat[this.focusIndex]));
      return;
    } else {
      return;
    }
    this.announceFocus();
    this.requestDraw();
  }

  announceFocus() {
    const f = this.flat[this.focusIndex];
    if (!f || !this.srLive) return;
    this.srLive.textContent = `${f.title}, ${f.org}, ${f.start}${f.end !== f.start ? " to " + f.end : ""}`;
  }

  /* --------------------------------------------------------- playhead */

  togglePlay() {
    if (this.playing) this.stop();
    else this.play();
  }

  play() {
    if (this.playing) return;
    if (this.progress >= 1) {
      this.progress = 0;
      this.triggered.clear();
      this.pulses.clear();
    }
    this.playing = true;
    this.startT = performance.now() - this.progress * this.duration;
    this.playBtn.dataset.state = "playing";
    this.playBtn.textContent = "■ Stop";
    this.loop();
  }

  stop() {
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.progress = 0;
    this.triggered.clear();
    this.pulses.clear();
    this.playBtn.dataset.state = "stopped";
    this.playBtn.textContent = "▶ Play my career";
    this.requestDraw();
  }

  // Single rAF loop drives both the playhead sweep AND the pulse fade-out that
  // outlives it. Keeps running while playing OR while any pulse is still
  // decaying, so the last notes fade gracefully after the head reaches the end.
  loop = (now) => {
    this.raf = 0;
    now = now || performance.now();

    if (this.playing) {
      this.progress = (now - this.startT) / this.duration;
      const px = this.gutter + this.progress * this.trackW;
      // Crossings: any block whose left edge the playhead has just passed.
      for (const r of this.rects) {
        if (r.x <= px && !this.triggered.has(r.entry.id)) {
          this.triggered.add(r.entry.id);
          this.pulses.set(r.entry.id, 1);
          window.bus.emit("playhead:tick", this.publicEntry(r.entry));
        }
      }
      if (this.progress >= 1) {
        this.playing = false;
        this.playBtn.dataset.state = "stopped";
        this.playBtn.textContent = "▶ Play my career";
      }
    }

    // Decay pulses each frame.
    for (const [id, p] of this.pulses) {
      const np = p - 0.032;
      if (np <= 0) this.pulses.delete(id);
      else this.pulses.set(id, np);
    }

    this.draw();

    if (this.playing || this.pulses.size > 0) {
      this.raf = requestAnimationFrame(this.loop);
    }
  };
}