import { Suspense } from "react";
import { notFound } from "next/navigation";
import Tracker from "../../Tracker";
import { missions } from "../../missions";

export function generateStaticParams() {
  return missions.map((m) => ({ id: m.id }));
}

async function MissionContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mission = missions.find((m) => m.id === id);
  if (!mission) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 py-5 sm:px-4 sm:py-8">
      <Tracker mission={mission} />
    </main>
  );
}

export default function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 py-5 sm:px-4 sm:py-8"
        >
          <p className="font-mono text-sm text-zinc-500">Loading mission...</p>
        </main>
      }
    >
      <MissionContent params={params} />
    </Suspense>
  );
}
