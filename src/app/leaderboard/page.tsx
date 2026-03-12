import { LeaderboardTabs } from '@/components/leaderboard/tabs';

export default function LeaderboardPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-10 sm:px-10 sm:py-14 lg:max-w-5xl lg:px-16 lg:py-16">
      <header className="mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Leaderboard
        </h1>
        <p className="mt-3 text-xl text-zinc-400 sm:text-2xl">
          Top scores by time limit.
        </p>
      </header>
      <div className="w-full max-w-2xl">
        <LeaderboardTabs />
      </div>
    </main>
  );
}
