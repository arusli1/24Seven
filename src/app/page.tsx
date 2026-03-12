import { ModeCard } from '@/components/mode-card';
import { listTiersWithCounts } from '@/lib/difficulty';

export default function HomePage() {
  const tiers = listTiersWithCounts();
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
      <section className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">TwentyFour Studio</p>
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">Master the 24 Game</h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Practice at your own pace, sprint in Speedrun mode, and climb the leaderboards. Difficulty tags come from the 4nums community
          dataset.
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        <ModeCard title="Play" description="Classic 24 Game with hints, timer, and difficulty filters." href="/play" icon={<span>🎯</span>} />
        <ModeCard title="Speedrun" description="Solve as many puzzles as you can before time runs out." href="/speedrun" icon={<span>⚡️</span>} />
        <ModeCard title="Leaderboards" description="See the fastest solvers per time limit." href="/leaderboard" icon={<span>🏆</span>} />
      </section>
      <section className="rounded-3xl bg-white/80 p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">Difficulty preview</h2>
        <p className="text-sm text-slate-500">Puzzles imported from 4nums with custom tiers.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          {tiers.map((tier) => (
            <div key={tier.tier} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-700">{tier.tier}</p>
              <p className="text-2xl font-bold text-slate-900">{tier.count}</p>
              <p className="text-xs text-slate-500">puzzles</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
