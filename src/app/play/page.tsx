import { PlayClient } from '@/components/play/play-client';
import { loadPuzzles } from '@/lib/difficulty';

export default function PlayPage() {
  const puzzles = loadPuzzles();
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10 space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Normal mode</p>
        <h1 className="text-3xl font-bold text-slate-900">Use each card once to make 24.</h1>
        <p className="text-slate-600">Difficulty and hint data are cached locally. Toggle a tier to target specific challenges.</p>
      </header>
      <PlayClient puzzles={puzzles} />
    </main>
  );
}
