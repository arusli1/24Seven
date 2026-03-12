import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[rgb(var(--border))]/60 bg-[rgb(var(--surface))]/50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-display text-sm font-semibold text-[rgb(var(--ink))]">24</p>
          <div className="flex gap-6">
            <Link
              href="/play"
              className="text-sm text-[rgb(var(--ink-muted))] transition-colors hover:text-[rgb(var(--accent))]"
            >
              Play
            </Link>
            <Link
              href="/speedrun"
              className="text-sm text-[rgb(var(--ink-muted))] transition-colors hover:text-[rgb(var(--accent))]"
            >
              Speedrun
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm text-[rgb(var(--ink-muted))] transition-colors hover:text-[rgb(var(--accent))]"
            >
              Leaderboard
            </Link>
            <Link
              href="/about"
              className="text-sm text-[rgb(var(--ink-muted))] transition-colors hover:text-[rgb(var(--accent))]"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
