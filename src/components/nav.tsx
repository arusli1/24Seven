'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/play', label: 'Play' },
  { href: '/speedrun', label: 'Speedrun' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/about', label: 'About' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgb(var(--border))]/60 bg-[rgb(var(--bg-elevated))]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-[rgb(var(--ink))] transition-smooth hover:text-[rgb(var(--accent))]"
        >
          24
        </Link>
        <div className="flex items-center gap-0.5 overflow-x-auto py-1 sm:gap-2 sm:overflow-visible">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-smooth sm:px-4 ${
                  isActive
                    ? 'bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))]'
                    : 'text-[rgb(var(--ink-muted))] hover:bg-[rgb(var(--accent-soft))]/50 hover:text-[rgb(var(--ink))]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
