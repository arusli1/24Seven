import { LeaderboardTabs } from '@/components/leaderboard/tabs';

export default function LeaderboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--ink))] sm:text-4xl">
          Leaderboard
        </h1>
        <p className="mt-2 text-[rgb(var(--ink-muted))]">
          Top scores by time limit.
        </p>
      </header>
      <LeaderboardTabs />
    </main>
  );
}
