/*
 * content.js — the ONLY data layer for the resume (build time).
 *
 * Reads content.json and produces a render-ready shape: the global year span,
 * axis ticks, and per-lane entries with their geometry pre-computed
 * (left% / width% / sub-row) so the .astro component can emit pure static DOM.
 *
 * No runtime logic lives here. Stage 3's canvas will reuse the same numbers.
 */

import raw from "../../content.json";

const MIN_BLOCK_YEARS = 1; // point-in-time entries (start === end) still render

/* Normalise + validate the raw JSON into a predictable shape. */
function normalise(raw) {
  const lanes = (raw.lanes ?? []).map((l) => ({
    id: String(l.id),
    label: String(l.label ?? l.id),
    instrument: String(l.instrument ?? "pad"),
  }));

  const byId = new Map(lanes.map((l) => [l.id, l]));
  const entries = (raw.entries ?? [])
    .filter((e) => byId.has(e.lane))
    .map((e) => ({
      ...e,
      id: String(e.id),
      lane: String(e.lane),
      start: Number(e.start),
      end: Number(e.end ?? e.start),
      title: String(e.title ?? ""),
      org: String(e.org ?? ""),
      summary: String(e.summary ?? ""),
      tags: Array.isArray(e.tags) ? e.tags.map(String) : [],
      links: Array.isArray(e.links) ? e.links.map(String) : [],
      detail: String(e.detail ?? ""),
    }));

  return { meta: raw.meta ?? {}, lanes, entries };
}

/*
 * Interval partitioning — assign overlapping entries in a lane to sub-rows so
 * nothing is hidden. Greedy by start time; this is optimal (interval graph
 * chromatic number == max clique). Treats a block as occupying [start, end)
 * and a point entry as [start, start+1).
 */
function assignSubRows(entries) {
  const sorted = [...entries].sort(
    (a, b) => a.start - b.start || a.end - b.end,
  );
  const rowEnds = []; // exclusive end of the last block in each sub-row
  const out = [];
  for (const e of sorted) {
    const dispEnd = e.start + Math.max(e.end - e.start, MIN_BLOCK_YEARS);
    let row = rowEnds.findIndex((end) => end <= e.start);
    if (row === -1) {
      row = rowEnds.length;
      rowEnds.push(dispEnd);
    } else {
      rowEnds[row] = dispEnd;
    }
    out.push({ ...e, _subRow: row });
  }
  return out;
}

function build() {
  const { meta, lanes, entries } = normalise(raw);

  const all = entries.flatMap((e) => [e.start, e.end]);
  const minStart = all.length ? Math.min(...all) : 0;
  const maxEnd = all.length ? Math.max(...all) : 0;
  const span = Math.max(maxEnd - minStart, MIN_BLOCK_YEARS);

  const ticks = [];
  for (let y = Math.ceil(minStart); y <= Math.floor(maxEnd); y++) ticks.push(y);
  // Adaptive thinning so the axis never crowds on long careers.
  const step =
    ticks.length <= 12 ? 1 : ticks.length <= 24 ? 2 : Math.ceil(ticks.length / 12);
  const visibleTicks = ticks.filter((_, i) => i % step === 0);

  const tickPct = (y) => ((y - minStart) / span) * 100;

  const builtLanes = lanes.map((lane) => {
    const laneEntries = entries.filter((e) => e.lane === lane.id);
    const placed = assignSubRows(laneEntries).map((e) => {
      const dur = Math.max(e.end - e.start, MIN_BLOCK_YEARS);
      return {
        ...e,
        _leftPct: ((e.start - minStart) / span) * 100,
        _widthPct: (dur / span) * 100,
      };
    });
    return {
      ...lane,
      entries: placed,
      subRows: placed.reduce((m, e) => Math.max(m, e._subRow + 1), 0),
    };
  });

  return {
    meta,
    lanes: builtLanes,
    axis: { minStart, maxEnd, span, ticks: visibleTicks, tickPct },
  };
}

export const content = build();
export default content;