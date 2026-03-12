import { ModeSwitcher } from '@/components/mode-switcher';
import { loadPuzzles } from '@/lib/difficulty';

export default function HomePage() {
  const puzzles = loadPuzzles();
  return (
    <main className="game24-page">
      <div className="game24-container">
        <h1 className="game24-title">24 Game</h1>
        <section className="game24-card">
          <ModeSwitcher puzzles={puzzles} />
        </section>
      </div>
    </main>
  );
}
