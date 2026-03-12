import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: '24 — Master the Numbers',
  description: 'Play the 24 Game with difficulty filtering, hints, and speedrun leaderboards. Make 24 using four numbers.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[rgb(var(--bg-base))]">
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
