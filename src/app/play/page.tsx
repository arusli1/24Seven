import { PlayClient } from '@/components/play/play-client';
import { loadPuzzles } from '@/lib/difficulty';

export default function PlayPage() {
  const puzzles = loadPuzzles();
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-10 sm:px-10 sm:py-14 lg:max-w-6xl lg:px-16 lg:py-16">
      <header className="mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Make <span className="text-[rgb(var(--accent))]">24</span>
        </h1>
        <p className="mt-3 text-xl text-zinc-400 sm:text-2xl">
          Select two cards, pick an operator <span className="text-white">+ − × ÷</span>, combine them.
        </p>
      </header>
      <PlayClient puzzles={puzzles} />
    </main>
  );
}
