import { SpeedrunClient } from '@/components/speedrun/speedrun-client';
import { loadPuzzles } from '@/lib/difficulty';

export default function SpeedrunPage() {
  const puzzles = loadPuzzles();
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--ink))] sm:text-4xl">
          Speedrun
        </h1>
        <p className="mt-2 text-[rgb(var(--ink-muted))]">
          Solve as many as you can before time runs out.
        </p>
      </header>
      <SpeedrunClient puzzles={puzzles} />
    </main>
  );
}
