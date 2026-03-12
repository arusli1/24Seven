import { Game } from '@/components/game';
import { loadPuzzles } from '@/lib/difficulty';

export default function HomePage() {
  const puzzles = loadPuzzles();
  return (
    <main className="flex min-h-screen min-h-dvh w-full flex-col items-center justify-center bg-[#050408] p-4 sm:p-6">
      <div className="flex w-full max-w-[min(95vw,1200px)] flex-col items-center">
        <h1 className="mb-2 text-center font-display text-6xl font-extrabold text-white sm:text-7xl">
          24
        </h1>
        <p className="mb-8 text-center text-zinc-400 sm:text-xl">
          Combine the numbers with + − × ÷ to make 24.
        </p>
        <Game puzzles={puzzles} />
      </div>
    </main>
  );
}
