import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.06] py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-white">24</p>
          <div className="flex flex-wrap gap-8">
            <Link href="/play" className="text-base text-zinc-400 transition-colors hover:text-white sm:text-lg">
              Play
            </Link>
            <Link href="/speedrun" className="text-base text-zinc-400 transition-colors hover:text-white sm:text-lg">
              Speedrun
            </Link>
            <Link href="/leaderboard" className="text-base text-zinc-400 transition-colors hover:text-white sm:text-lg">
              Leaderboard
            </Link>
            <Link href="/about" className="text-base text-zinc-400 transition-colors hover:text-white sm:text-lg">
              About
            </Link>
          </div>
        </div>
        <p className="mt-8 text-sm text-zinc-500">{new Date().getFullYear()} • Make 24</p>
      </div>
    </footer>
  );
}
