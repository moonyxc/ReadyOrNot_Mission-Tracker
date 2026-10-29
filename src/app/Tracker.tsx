"use client";

import { useEffect, useState } from "react";
import {
  getManualPersonnelCounters,
  personnelCounterKeys,
  type Mission,
  type MissionScoreStat,
  type Objective,
  type PersonnelCounter,
} from "./missions";
import {
  emptyCounts,
  parseStoredCounts,
  type Counts,
} from "./tracker-storage";

const personnelCounterTitles: Record<PersonnelCounter, string> = {
  suspects: "Suspects",
  civilians: "Civilians",
};

function Pips({
  objectiveTitle,
  value,
  max,
  onSet,
}: {
  objectiveTitle: string;
  value: number;
  max: number;
  onSet: (n: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label={`${objectiveTitle} progress`}
      className="mt-3 flex flex-wrap gap-1"
    >
      {Array.from({ length: max }, (_, i) => {
        const on = i < value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSet(on && i === value - 1 ? i : i + 1)}
            aria-label={`Set ${objectiveTitle} to ${i + 1}`}
            aria-pressed={on}
            className={`h-5 w-3 -skew-x-12 border transition ${
              on
                ? "border-amber bg-amber shadow-[0_0_8px_rgba(245,165,36,0.6)]"
                : "border-zinc-700 bg-black/60 hover:border-amber/60"
            }`}
          />
        );
      })}
    </div>
  );
}

function Row({
  o,
  index,
  value,
  onSet,
}: {
  o: Objective;
  index: number;
  value: number;
  onSet: (n: number) => void;
}) {
  const max = o.target ?? Number.MAX_SAFE_INTEGER;
  const complete = o.target !== null && value >= o.target;
  return (
    <li className={`panel relative p-4 sm:p-5 ${complete ? "panel-done" : ""}`}>
      <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap sm:gap-4">
        <div
          aria-hidden="true"
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center border-2 font-mono text-lg ${
            complete
              ? "border-ok bg-ok/20 text-ok"
              : "border-zinc-600 text-transparent"
          }`}
        >
          ✓
        </div>
        <span className="sr-only">{complete ? "Completed" : "Incomplete"}</span>

        <div className="min-w-0 flex-1 basis-[calc(100%-3rem)] sm:basis-0">
          <p className="font-mono text-[11px] tracking-[0.25em] text-zinc-500">
            {o.type === "main" || o.type === "soft"
              ? `OBJECTIVE ${String(index + 1).padStart(2, "0")}`
              : "STAT"}
          </p>
          <h3
            className={`font-display text-xl uppercase tracking-wide sm:text-2xl ${
              complete ? "text-zinc-400 line-through decoration-ok/60" : ""
            }`}
          >
            {o.title}
          </h3>
          <p className="text-lg leading-tight text-zinc-400">{o.description}</p>
          {o.kind === "count" && o.target !== null && (
            <Pips
              objectiveTitle={o.title}
              value={value}
              max={o.target}
              onSet={onSet}
            />
          )}
        </div>

        {o.kind === "count" ? (
          <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end">
            <p
              className={`font-mono text-4xl leading-none ${
                complete ? "text-ok" : "text-amber"
              }`}
            >
              {value}
              <span className="text-xl text-zinc-600">/{o.target ?? "?"}</span>
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onSet(Math.max(0, value - 1))}
                className="btn h-11 w-11 text-2xl"
                aria-label={`Decrease ${o.title}`}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => onSet(Math.min(max, value + 1))}
                className="btn btn-primary h-11 w-11 text-2xl"
                aria-label={`Increase ${o.title}`}
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSet(complete ? 0 : 1)}
            className={`btn h-11 w-full shrink-0 px-4 text-sm tracking-widest sm:w-auto ${
              complete ? "" : "btn-primary"
            }`}
            aria-label={
              complete
                ? `Undo completion of ${o.title}`
                : `Mark ${o.title} complete`
            }
          >
            {complete ? "UNDO" : "REPORT"}
          </button>
        )}
      </div>
    </li>
  );
}

function PersonnelCounterRow({
  title,
  value,
  onSet,
}: {
  title: string;
  value: number;
  onSet: (n: number) => void;
}) {
  return (
    <li className="panel relative p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-zinc-500">
            PERSONNEL COUNT
          </p>
          <h3 className="font-display text-xl uppercase tracking-wide sm:text-2xl">
            {title}
          </h3>
          <p className="text-lg leading-tight text-zinc-400">
            Total unknown; track manually.
          </p>
        </div>

        <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <output
            aria-label={`${title} counted`}
            aria-live="polite"
            className="font-mono text-4xl leading-none text-amber"
          >
            {value}
            <span className="text-xl text-zinc-600">/?</span>
          </output>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onSet(Math.max(0, value - 1))}
              className="btn h-11 w-11 text-2xl"
              aria-label={`Decrease ${title} count`}
            >
              −
            </button>
            <button
              type="button"
              onClick={() =>
                onSet(Math.min(Number.MAX_SAFE_INTEGER, value + 1))
              }
              className="btn btn-primary h-11 w-11 text-2xl"
              aria-label={`Increase ${title} count`}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function ScoreStatRow({
  stat,
  value,
  onSet,
}: {
  stat: MissionScoreStat;
  value: number;
  onSet: (n: number) => void;
}) {
  const complete = value >= stat.target;

  return (
    <li className="panel relative p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-zinc-500">
            SCORE STAT
          </p>
          <h3 className="font-display text-xl uppercase tracking-wide sm:text-2xl">
            {stat.title}
          </h3>
        </div>

        <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <output
            aria-label={`${stat.title} score`}
            aria-live="polite"
            className={`font-mono text-4xl leading-none ${
              complete ? "text-ok" : "text-amber"
            }`}
          >
            {value}
            <span className="text-xl text-zinc-600">/{stat.target}</span>
          </output>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onSet(Math.max(0, value - 1))}
              className="btn h-11 w-11 text-2xl"
              aria-label={`Decrease ${stat.title}`}
            >
              −
            </button>
            <button
              type="button"
              onClick={() => onSet(Math.min(stat.target, value + 1))}
              className="btn btn-primary h-11 w-11 text-2xl"
              aria-label={`Increase ${stat.title}`}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display mt-8 mb-3 border-b border-line pb-2 text-sm uppercase tracking-[0.35em] text-zinc-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Tracker({ mission }: { mission: Mission }) {
  const key = `ron-tracker:v4:${mission.id}`;
  const [counts, setCounts] = useState<Counts>(() => emptyCounts(mission));
  const [storageStatus, setStorageStatus] = useState<{
    key: string;
    available: boolean;
    message: string | null;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    let nextCounts = emptyCounts(mission);
    let nextStatus = {
      key,
      available: true,
      message: null as string | null,
    };
    let raw: string | null = null;

    try {
      raw = localStorage.getItem(key);
    } catch {
      nextStatus = {
        key,
        available: false,
        message:
          "Browser storage is unavailable. Progress will not be saved.",
      };
    }

    if (nextStatus.available) {
      const saved = parseStoredCounts(raw, mission);
      nextCounts = saved.counts;
      if (saved.invalid) {
        nextStatus.message =
          "Some saved progress was invalid and has been reset.";
      }
    }

    // Browser storage is only available after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCounts(nextCounts);
    setStorageStatus(nextStatus);
  }, [key, mission]);

  useEffect(() => {
    if (storageStatus?.key !== key || !storageStatus.available) return;

    try {
      localStorage.setItem(key, JSON.stringify(counts));
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageStatus((current) =>
        current?.key === key
          ? {
              ...current,
              available: false,
              message: "Progress could not be saved in this browser.",
            }
          : current,
      );
    }
  }, [counts, key, storageStatus]);

  const set = (id: string, n: number) =>
    setCounts((c) => ({ ...c, [id]: n }));

  const val = (o: Objective) =>
    Math.max(
      0,
      Math.min(counts[o.id] ?? 0, o.target ?? Number.MAX_SAFE_INTEGER),
    );
  const scoreStatVal = (stat: MissionScoreStat) =>
    Math.max(0, Math.min(counts[stat.id] ?? 0, stat.target));
  const done = (o: Objective) =>
    o.target !== null && val(o) >= o.target;

  const objs = mission.objectives;
  const mains = objs.filter((o) => o.type === "main");
  const softs = objs.filter((o) => o.type === "soft");
  const scoreStats = mission.scoreStats ?? [];
  const manualPersonnelCounters = getManualPersonnelCounters(mission);

  const knownObjectives = objs.filter((o) => o.target !== null);
  const unknownTargetCount = objs.length - knownObjectives.length;
  const totalTarget = knownObjectives.reduce((s, o) => s + (o.target ?? 0), 0);
  const totalDone = knownObjectives.reduce((s, o) => s + val(o), 0);
  const percent = totalTarget ? Math.round((totalDone / totalTarget) * 100) : 0;
  const completed = knownObjectives.filter(done).length;
  const allDone =
    knownObjectives.length > 0 && completed === knownObjectives.length;

  return (
    <div className="w-full">
      <header className="panel relative overflow-hidden p-4 sm:p-8">
        <div className="tape absolute inset-x-0 top-0 h-1.5" />
        <div className="flex flex-wrap items-start justify-between gap-4 pt-2">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-amber">
              MISSION {String(mission.number).padStart(2, "0")}
            </p>
            <h1 className="font-display mt-2 break-words text-3xl font-bold uppercase leading-none tracking-wide sm:text-6xl">
              {mission.name}
            </h1>
          </div>
          {allDone && (
            <div className="stamp stamp-on font-display text-xl tracking-[0.2em]">
              MISSION COMPLETE
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between">
            <p className="font-mono text-xs tracking-[0.3em] text-zinc-500">
              MISSION SCORE
            </p>
            <p
              className={`font-display text-5xl leading-none sm:text-6xl ${
                allDone ? "text-ok" : "text-amber"
              }`}
            >
              {percent}%
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="Mission score"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${percent}% complete`}
            className="mt-3 h-5 border border-line bg-black/70 p-0.5"
          >
            <div
              aria-hidden="true"
              className={`stripes h-full transition-all duration-500 ${
                allDone ? "bg-ok" : "bg-amber"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs tracking-widest text-zinc-500">
            OBJECTIVES {completed}/{knownObjectives.length} COMPLETE
            {unknownTargetCount > 0 && ` · ${unknownTargetCount} TARGETS UNKNOWN`}
          </p>
        </div>
        {storageStatus?.key === key && storageStatus.message && (
          <p
            role="status"
            className="mt-4 border border-amber/40 bg-black/50 p-3 font-mono text-sm text-amber"
          >
            {storageStatus.message}
          </p>
        )}
      </header>

      <Section title="Main Objectives">
        <ul className="flex flex-col gap-3">
          {mains.map((o, i) => (
            <Row key={o.id} o={o} index={i} value={val(o)} onSet={(n) => set(o.id, n)} />
          ))}
        </ul>
      </Section>

      {manualPersonnelCounters.length > 0 && (
        <Section title="Personnel Counts">
          <ul className="flex flex-col gap-3">
            {manualPersonnelCounters.map((counter) => (
              <PersonnelCounterRow
                key={counter}
                title={personnelCounterTitles[counter]}
                value={counts[personnelCounterKeys[counter]] ?? 0}
                onSet={(n) => set(personnelCounterKeys[counter], n)}
              />
            ))}
          </ul>
        </Section>
      )}

      <Section title="Soft Objectives">
        <ul className="flex flex-col gap-3">
          {softs.map((o, i) => (
            <Row key={o.id} o={o} index={i} value={val(o)} onSet={(n) => set(o.id, n)} />
          ))}
        </ul>
      </Section>

      {scoreStats.length > 0 && (
        <Section title="Score Stats">
          <ul className="flex flex-col gap-3">
            {scoreStats.map((stat) => (
              <ScoreStatRow
                key={stat.id}
                stat={stat}
                value={scoreStatVal(stat)}
                onSet={(n) => set(stat.id, n)}
              />
            ))}
          </ul>
        </Section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-sm">
        {confirmReset ? (
          <>
            <span className="text-danger">RESET MISSION?</span>
            <button
              type="button"
              onClick={() => {
                setCounts(emptyCounts(mission));
                setConfirmReset(false);
              }}
              className="btn btn-danger px-4 py-2"
            >
              YES
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="btn px-4 py-2"
            >
              CANCEL
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="btn px-4 py-2 text-zinc-500"
          >
            ↺ RESET MISSION
          </button>
        )}
      </div>
    </div>
  );
}
