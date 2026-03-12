import { PlayClient } from '@/components/play/play-client';
import { loadPuzzles } from '@/lib/difficulty';

export default function PlayPage() {
  const puzzles = loadPuzzles();
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--ink))] sm:text-4xl">
          Make <span className="text-[rgb(var(--accent))]">24</span>
        </h1>
        <p className="mt-2 text-[rgb(var(--ink-muted))]">
          Select two cards, pick an operator, combine them.
        </p>
      </header>
      <PlayClient puzzles={puzzles} />
    </main>
  );
}
