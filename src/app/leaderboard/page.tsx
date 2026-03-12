import { LeaderboardTabs } from '@/components/leaderboard/tabs';

export default function LeaderboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Leaderboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Fastest speedrun solvers</h1>
        <p className="text-slate-600">Top 50 entries per time limit update live from SQLite.</p>
      </header>
      <LeaderboardTabs />
    </main>
  );
}
