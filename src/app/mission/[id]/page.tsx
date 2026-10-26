import Link from "next/link";
import { notFound } from "next/navigation";
import Tracker from "../../Tracker";
import { missions } from "../../missions";

export function generateStaticParams() {
  return missions.map((m) => ({ id: m.id }));
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mission = missions.find((m) => m.id === id);
  if (!mission) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 py-5 sm:px-4 sm:py-8">
      <Link
        href="/"
        className="mb-6 font-mono text-sm text-police hover:text-amber"
      >
        ◀ ZURÜCK ZUR EINSATZWAHL
      </Link>
      <Tracker mission={mission} />
    </main>
  );
}
