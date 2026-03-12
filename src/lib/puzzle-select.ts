import type { Puzzle } from './types';

const RECENT_SIZE = 50;

/** Pick a puzzle biased towards harder ones (higher difficulty), avoiding recently shown. */
export function selectNextPuzzle(
  puzzles: Puzzle[],
  recentIds: string[],
  biasStrength = 2
): Puzzle {
  if (puzzles.length === 0) throw new Error('Puzzle pool is empty');
  const exclude = new Set(recentIds);
  const pool = puzzles.filter((p) => !exclude.has(p.id));
  const candidates = pool.length > 0 ? pool : puzzles;
  const maxDiff = Math.max(...candidates.map((p) => p.difficulty), 1);
  const weights = candidates.map((p) => {
    const norm = p.difficulty / maxDiff;
    return Math.pow(norm, biasStrength);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function pushRecent(recentIds: string[], id: string, maxSize = RECENT_SIZE): string[] {
  const next = [...recentIds.filter((x) => x !== id), id];
  return next.slice(-maxSize);
}
