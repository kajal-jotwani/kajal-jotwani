"use client";

import { useState } from "react";
import { site } from "@/lib/content";
import { emit } from "@/lib/bus";
import Reveal from "@/components/Reveal";

export default function Ama() {
  const a = site.ama;
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const enabled = a.endpoint.trim().length > 0;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enabled || !text.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(a.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          question: text.trim(),
          _subject: "🌱 anonymous question — kajaljotwani.me",
          _template: "box",
          _captcha: "false",
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setText("");
      emit("plink", 7);
    } catch {
      setStatus("error");
    }
  };

  return (
    <Reveal>
      <div className="flex h-full flex-col rounded-2xl border border-line bg-bg-card/70 p-6 sm:p-8">
        <h3 className="font-display text-2xl">{a.trackTitle}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{a.intro}</p>

        <form onSubmit={send} className="mt-5 flex flex-1 flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={a.placeholder}
            rows={4}
            disabled={!enabled || status === "sending"}
            className="w-full flex-1 resize-none rounded-xl border border-line bg-bg-soft/60 p-4 text-[14px] leading-relaxed outline-none transition-colors placeholder:text-muted/60 focus:border-accent disabled:opacity-60"
          />
          {enabled ? (
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] text-muted">
                {status === "done" && a.successNote}
                {status === "error" && "hmm, that didn't send — try again?"}
              </span>
              <button
                type="submit"
                disabled={status === "sending" || !text.trim()}
                className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {status === "sending" ? "sending…" : a.buttonLabel}
              </button>
            </div>
          ) : (
            <p className="font-hand mt-4 -rotate-1 text-[15px] text-pink">
              {a.disabledNote}{" "}
              <a className="squiggle text-accent" href={`mailto:${site.identity.email}`}>
                email works too
              </a>
            </p>
          )}
        </form>
      </div>
    </Reveal>
  );
}
