import { Game } from '@/components/game';
import { loadPuzzles } from '@/lib/difficulty';

export default function HomePage() {
  const puzzles = loadPuzzles();
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden p-6 sm:p-8">
      <Game puzzles={puzzles} />
    </main>
  );
}
