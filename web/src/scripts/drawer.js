/*
 * drawer.js — right-side detail drawer.
 *
 * Pure client module. Subscribes to entry:click on the bus (emitted by the
 * sequencer on click / Enter), renders the pre-built detailHtml, and owns all
 * the dialog hygiene: backdrop, Esc to close, focus trap, return focus, and
 * body-scroll lock. No data fetching — everything arrives on the event payload.
 */

function $(sel, root = document) {
  return root.querySelector(sel);
}

class Drawer {
  constructor() {
    this.root = $('[data-drawer]');
    if (!this.root || this.root._drawer) return;
    this.root._drawer = this;

    this.panel = $('[data-drawer-panel]', this.root);
    this.titleEl = $('[data-drawer-title]', this.root);
    this.metaEl = $('[data-drawer-meta]', this.root);
    this.bodyEl = $('[data-drawer-body]', this.root);
    this.linksEl = $('[data-drawer-links]', this.root);
    this.backdrop = $('[data-drawer-backdrop]', this.root);
    this.closeBtn = $('[data-drawer-close]', this.root);

    this.previouslyFocused = null;

    this.closeBtn.addEventListener("click", () => this.close());
    this.backdrop.addEventListener("click", () => this.close());
    this.root.addEventListener("keydown", (e) => this.onKey(e));

    window.bus.on("entry:click", (entry) => this.open(entry));
  }

  open(entry) {
    this.previouslyFocused = document.activeElement;

    this.titleEl.textContent = entry.title || "—";

    const years =
      entry.start === entry.end
        ? String(entry.start)
        : `${entry.start}–${entry.end}`;
    this.metaEl.innerHTML = "";
    const bits = [entry.org, years, entry.laneLabel].filter(Boolean);
    if (bits.length) {
      const p = document.createElement("p");
      p.className = "drawer__meta-line";
      p.textContent = bits.join(" · ");
      this.metaEl.appendChild(p);
    }
    if (entry.tags?.length) {
      const ul = document.createElement("ul");
      ul.className = "drawer__tags";
      for (const t of entry.tags) {
        const li = document.createElement("li");
        li.textContent = t;
        ul.appendChild(li);
      }
      this.metaEl.appendChild(ul);
    }

    this.bodyEl.innerHTML = entry.detailHtml || "";

    this.linksEl.innerHTML = "";
    if (entry.links?.length) {
      for (const url of entry.links) {
        const a = document.createElement("a");
        a.href = url;
        a.textContent = url.replace(/^https?:\/\//, "");
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "drawer__link";
        this.linksEl.appendChild(a);
      }
    }

    this.root.hidden = false;
    this.panel.setAttribute("aria-modal", "true");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      this.root.classList.add("is-open");
      this.closeBtn.focus();
    });
  }

  close() {
    this.root.classList.remove("is-open");
    document.body.style.overflow = "";
    const finish = () => {
      this.root.hidden = true;
      this.root.removeEventListener("transitionend", finish);
      if (this.previouslyFocused && typeof this.previouslyFocused.focus === "function") {
        this.previouslyFocused.focus();
      }
    };
    if (this.transitionSupports()) {
      this.root.addEventListener("transitionend", finish);
    } else {
      finish();
    }
  }

  transitionSupports() {
    return (
      typeof TransitionEvent !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  onKey(e) {
    if (this.root.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key === "Tab") this.trapFocus(e);
  }

  trapFocus(e) {
    const focusable = this.panel.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) {
      e.preventDefault();
      this.closeBtn.focus();
      return;
    }
    const list = Array.from(focusable);
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new Drawer(), { once: true });
} else {
  new Drawer();
}