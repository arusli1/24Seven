import { Game } from '@/components/game';
import { loadPuzzles } from '@/lib/difficulty';

export default function HomePage() {
  const puzzles = loadPuzzles();
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0f0f12] p-6 sm:p-8">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#1a1a1f] px-8 py-10 shadow-xl sm:px-12 sm:py-12">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="text-2xl">🃏</span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">24</h1>
        </div>
        <p className="mb-8 text-center text-sm text-zinc-400 sm:text-base">
          Combine the numbers with + − × ÷ to make 24.
        </p>
        <Game puzzles={puzzles} />
      </div>
    </main>
  );
}
