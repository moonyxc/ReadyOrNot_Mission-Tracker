import Link from "next/link";
import { missions } from "./missions";

const groups = [...new Set(missions.map((m) => m.group))];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 py-6 sm:px-4 sm:py-10">
      <div className="tape h-2 w-full" />

      <header className="rise mt-10 mb-12">
        <div className="flex items-center gap-3 font-mono text-xs tracking-[0.35em] text-police">
          <span className="inline-block h-2 w-2 rounded-full bg-police blink" />
          LSPD · SWAT · TOC LINK ESTABLISHED
        </div>
        <h1 className="font-display mt-3 text-5xl font-bold uppercase leading-[0.9] tracking-wide sm:text-8xl">
          Ready or Not
          <span className="block text-amber">Mission Tracker</span>
        </h1>
        <p className="mt-4 font-mono text-sm text-zinc-500">
          &gt; SELECT DEPLOYMENT<span className="blink">_</span>
        </p>
      </header>

      {groups.map((group) => (
        <section key={group} className="mb-10">
          <h2 className="font-display mb-4 border-b border-line pb-2 text-sm uppercase tracking-[0.35em] text-zinc-400">
            {group}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {missions
              .filter((m) => m.group === group)
              .map((m, i) => (
                <Link
                  key={m.id}
                  href={`/mission/${m.id}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className="panel rise group relative block overflow-hidden p-6"
                >
                  <span className="font-display pointer-events-none absolute -right-2 -top-6 text-[9rem] font-bold leading-none text-white/[0.04]">
                    {String(m.number).padStart(2, "0")}
                  </span>
                  <div className="relative flex items-start justify-between">
                    <span className="font-mono text-xs tracking-[0.25em] text-amber">
                      MISSION {String(m.number).padStart(2, "0")}
                    </span>
                    <span className="border border-ok/40 bg-ok/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-ok">
                      ● READY
                    </span>
                  </div>
                  <h3 className="font-display relative mt-10 text-3xl font-bold uppercase leading-tight transition-colors group-hover:text-amber">
                    {m.name}
                  </h3>
                  <p className="relative mt-1 font-mono text-xs text-zinc-500">
                    {m.objectives.length} OBJECTIVES
                  </p>
                  <div className="font-display relative mt-6 flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-police transition-all group-hover:gap-4 group-hover:text-amber">
                    Deploy <span aria-hidden>▶▶</span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}

