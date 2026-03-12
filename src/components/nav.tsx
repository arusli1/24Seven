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
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgb(var(--bg-base))]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-white transition-colors hover:text-[rgb(var(--accent))] sm:text-2xl"
        >
          24
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto py-1 sm:gap-2 sm:overflow-visible">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2.5 text-base font-medium transition-colors sm:px-5 sm:text-lg ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
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
