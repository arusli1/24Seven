import { SpeedrunClient } from '@/components/speedrun/speedrun-client';
import { loadPuzzles } from '@/lib/difficulty';

export default function SpeedrunPage() {
  const puzzles = loadPuzzles();
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8 space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Speedrun</p>
        <h1 className="text-3xl font-bold text-slate-900">Beat the clock.</h1>
        <p className="text-slate-600">Choose a limit, solve as many puzzles as possible, submit your best streak.</p>
      </header>
      <SpeedrunClient puzzles={puzzles} />
    </main>
  );
}
