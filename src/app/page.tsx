import { Game } from '@/components/game';
import { loadPuzzles } from '@/lib/difficulty';

export default function HomePage() {
  const puzzles = loadPuzzles();
  return (
    <main className="relative flex min-h-screen min-h-dvh w-full flex-col items-center justify-center overflow-x-hidden bg-[#050408] p-4 sm:p-6 md:p-8">
      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
            24
          </h1>
          <p className="mt-2 text-zinc-400 sm:text-lg">
            Combine the numbers with + − × ÷ to make 24.
          </p>
        </div>
        <Game puzzles={puzzles} />
      </div>
    </main>
  );
}
