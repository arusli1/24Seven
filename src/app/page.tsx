import { ModeCard } from '@/components/mode-card';

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-20">
      <section className="animate-fade-in space-y-6 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-[rgb(var(--ink))] sm:text-5xl md:text-6xl">
          Make <span className="text-[rgb(var(--accent))]">24</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-[rgb(var(--ink-muted))]">
          Use four numbers and +, −, ×, ÷ to make exactly 24.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <ModeCard
          title="Play"
          description="Combine cards to make 24."
          href="/play"
          icon="🎯"
          accent="amber"
        />
        <ModeCard
          title="Speedrun"
          description="Solve as many as you can."
          href="/speedrun"
          icon="⚡"
          accent="coral"
        />
        <ModeCard
          title="Leaderboard"
          description="Top scores."
          href="/leaderboard"
          icon="🏆"
          accent="teal"
        />
      </section>
    </main>
  );
}
