import { Puzzle } from '@/lib/types';

function hashDate(str: string): number {
  let h = 5381;
  for (const ch of str) h = ((h << 5) + h) ^ ch.charCodeAt(0);
  return h & 0x7fffffff;
}

const EPOCH = new Date('2026-01-01');

export function getDailyNumber(): number {
  const now = new Date();
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcEpoch = Date.UTC(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate());
  return Math.floor((utcNow - utcEpoch) / 86400000);
}

export function getDailyPuzzle(puzzles: Puzzle[]): Puzzle {
  const pool = puzzles.filter((p) => !p.custom);
  if (pool.length === 0) return puzzles[0];
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const idx = hashDate(dateStr) % pool.length;
  return pool[idx];
}

export function formatDailyDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
