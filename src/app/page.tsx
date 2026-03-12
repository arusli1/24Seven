import Link from 'next/link';
import { ModeCard } from '@/components/mode-card';

export default function HomePage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 sm:px-10 sm:py-28 lg:max-w-7xl lg:px-16 lg:py-36">
      {/* Hero - centered */}
      <section className="mb-20 w-full max-w-4xl text-center sm:mb-28 lg:mb-32">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
          Make <span className="text-[rgb(var(--accent))]">24</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-xl text-zinc-400 sm:text-2xl lg:text-3xl">
          Use four numbers and <span className="text-white">+ − × ÷</span> to make exactly 24. Practice at your pace or race the clock.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            href="/play"
            className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-10 py-4 text-base font-semibold text-black transition-colors hover:bg-[rgb(var(--accent-hover))] sm:px-12 sm:py-4.5 sm:text-lg"
          >
            Play now <span className="text-lg sm:text-xl">→</span>
          </Link>
          <Link
            href="/speedrun"
            className="inline-flex items-center rounded-full border border-white/20 px-10 py-4 text-base font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.04] sm:px-12 sm:py-4.5 sm:text-lg"
          >
            Speedrun
          </Link>
        </div>
      </section>

      {/* Numbered sections - centered, bigger cards */}
      <section className="w-full max-w-4xl space-y-1 border-t border-white/[0.06] pt-20 lg:pt-28">
        <ModeCard
          number="01"
          title="Play"
          description="Combine cards with + − × ÷ to reach 24. Use each number once. Hints available when you need them."
          href="/play"
        />
        <ModeCard
          number="02"
          title="Speedrun"
          description="Solve as many puzzles as you can before time runs out. Submit your best score to the leaderboard."
          href="/speedrun"
        />
        <ModeCard
          number="03"
          title="Leaderboard"
          description="See the fastest solvers. Top scores by time limit—60s, 2min, or 5min."
          href="/leaderboard"
        />
      </section>

      {/* CTA - centered */}
      <section className="mt-20 w-full max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.02] p-14 text-center sm:mt-28 sm:p-20">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Where great work gets done.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-xl text-zinc-400 sm:text-2xl">
          Start sharpening your mind in minutes.
        </p>
        <Link
          href="/play"
          className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-[rgb(var(--accent))] transition-colors hover:gap-3 sm:text-lg"
        >
          Get started <span>→</span>
        </Link>
      </section>
    </main>
  );
}
