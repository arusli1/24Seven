import { Game } from '@/components/game';
import { loadPuzzles } from '@/lib/difficulty';

export default function HomePage() {
  const puzzles = loadPuzzles();
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <Game puzzles={puzzles} />
    </main>
  );
}
