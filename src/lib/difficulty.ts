import { existsSync, readFileSync } from 'fs';
import path from 'path';
import type { DifficultyTier, Puzzle } from './types';
import { solvePuzzle } from './solver';

let cache: Puzzle[] | null = null;

export function getTierFromScore(score: number): DifficultyTier {
  if (score < 160) return 'Easy';
  if (score < 260) return 'Medium';
  if (score < 420) return 'Hard';
  return 'Expert';
}

export function loadPuzzles(): Puzzle[] {
  if (cache) return cache;
  const mainPath = path.join(process.cwd(), 'data', 'difficulties.json');
  const samplePath = path.join(process.cwd(), 'data', 'difficulties.sample.json');
  const filePath = existsSync(mainPath) ? mainPath : samplePath;
  const raw = JSON.parse(readFileSync(filePath, 'utf-8')) as { puzzles: { nums: number[]; difficulty: number; solveRate?: number }[] };
  cache = raw.puzzles.map((entry, index) => {
    const solution = solvePuzzle(entry.nums);
    return {
      id: `${entry.nums.join('-')}-${index}`,
      numbers: entry.nums.slice(0, 4) as [number, number, number, number],
      difficulty: entry.difficulty,
      tier: getTierFromScore(entry.difficulty),
      solveRate: entry.solveRate,
      solutions: solution ? [solution.expression] : undefined
    };
  });
  return cache;
}

export function getPuzzlesByTier(tier?: DifficultyTier) {
  const puzzles = loadPuzzles();
  if (!tier) return puzzles;
  return puzzles.filter((puzzle) => puzzle.tier === tier);
}

export function randomPuzzle(tier?: DifficultyTier): Puzzle {
  const pool = getPuzzlesByTier(tier);
  if (pool.length === 0) {
    throw new Error('Puzzle pool is empty. Run the importer to fetch data.');
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function listTiersWithCounts() {
  const puzzles = loadPuzzles();
  return ['Easy', 'Medium', 'Hard', 'Expert'].map((tier) => ({
    tier: tier as DifficultyTier,
    count: puzzles.filter((puzzle) => puzzle.tier === tier).length
  }));
}
