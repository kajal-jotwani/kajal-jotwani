"use client";

import Link from "next/link";
import { site } from "@/lib/content";
import { emit } from "@/lib/bus";
import { SoundToggle, ThemeToggle } from "@/components/Toggles";
import Logo from "@/components/Logo";

const links = [
  { label: "about", href: "#about" },
  { label: "journey", href: "#timeline" },
  { label: "work", href: "#work" },
  { label: "notes", href: "#notes" },
  { label: "chat", href: "#chat" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          aria-label={`${site.identity.name} — home`}
          className="group flex items-center gap-2 text-ink"
          onMouseEnter={() => emit("plink", 7)}
        >
          <Logo className="h-5 w-5 transition-transform duration-300 group-hover:scale-y-125" />
          <span className="font-hand text-lg tracking-wide">
            {site.identity.firstName}
            <span className="text-accent">.</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onMouseEnter={() => emit("plink", i + 2)}
              className="squiggle font-mono text-[12px] lowercase tracking-widest text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/play"
            onMouseEnter={() => emit("plink", 0)}
            className="font-mono rounded-full border border-line px-3 py-1 text-[11px] tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
          >
            /play ⏵
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
