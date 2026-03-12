import { Game } from '@/components/game';
import { loadPuzzles } from '@/lib/difficulty';

export default function HomePage() {
  const puzzles = loadPuzzles();
  return (
    <main className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-black p-6 sm:p-10">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] px-8 py-12 sm:px-12 sm:py-14">
        <div className="mb-8 text-center">
          <h1 className="font-display text-5xl font-extrabold text-white sm:text-6xl">
            24
          </h1>
        </div>
        <Game puzzles={puzzles} />
      </div>
    </main>
  );
}
