import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';
import { PrismaClient } from '@prisma/client';

const SOURCE_URL = 'https://www.4nums.com/game/difficulties/';
const prisma = new PrismaClient();

async function fetchHtml() {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  return response.text();
}

function extractFromHtml(html: string) {
  const root = parse(html);
  const rows = root.querySelectorAll('tr');
  const puzzles: { nums: number[]; difficulty: number; solveRate?: number }[] = [];
  for (const row of rows) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) continue;
    const numsMatch = cells[0].text.match(/\d+/g);
    if (!numsMatch || numsMatch.length < 4) continue;
    const nums = numsMatch.slice(0, 4).map((n) => Number(n));
    const difficultyValue = Number(cells[1].text.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(difficultyValue)) continue;
    const solveRateMatch = cells.length > 2 ? Number(cells[2].text.replace(/[^0-9.]/g, '')) : undefined;
    puzzles.push({ nums, difficulty: difficultyValue, solveRate: Number.isFinite(solveRateMatch) ? solveRateMatch : undefined });
  }
  if (puzzles.length > 0) {
    return puzzles;
  }

  const scripts = root.querySelectorAll('script');
  for (const script of scripts) {
    const jsonMatches = script.innerHTML.match(/\{\"nums\":\[[^}]+\}\}/g);
    if (jsonMatches) {
      const parsed = jsonMatches.map((fragment) => JSON.parse(fragment.replace(/\\"/g, '"')));
      return parsed.map((entry: any) => ({
        nums: entry.nums,
        difficulty: Number(entry.difficulty ?? entry.score ?? 0),
        solveRate: entry.solveRate ?? entry.rate
      }));
    }
  }
  return [];
}

function mapTier(score: number) {
  if (score < 160) return 'Easy';
  if (score < 260) return 'Medium';
  if (score < 420) return 'Hard';
  return 'Expert';
}

async function main() {
  let dataset: { nums: number[]; difficulty: number; solveRate?: number }[] = [];
  try {
    const html = await fetchHtml();
    dataset = extractFromHtml(html);
  } catch (error) {
    console.warn('Failed to fetch or parse live data:', error);
  }

  if (dataset.length === 0) {
    console.warn('Falling back to bundled sample dataset.');
    const fallback = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'difficulties.sample.json'), 'utf-8'));
    dataset = fallback.puzzles;
  }

  const targetPath = path.join(process.cwd(), 'data', 'difficulties.json');
  writeFileSync(targetPath, JSON.stringify({ puzzles: dataset }, null, 2));
  console.log(`Saved ${dataset.length} puzzles to ${targetPath}`);

  for (const puzzle of dataset) {
    const id = puzzle.nums.join('-');
    await prisma.puzzle.upsert({
      where: { id },
      update: {
        numbers: JSON.stringify(puzzle.nums),
        difficulty: Math.round(puzzle.difficulty),
        tier: mapTier(puzzle.difficulty),
        solveRate: puzzle.solveRate ?? null,
        solutions: null
      },
      create: {
        id,
        numbers: JSON.stringify(puzzle.nums),
        difficulty: Math.round(puzzle.difficulty),
        tier: mapTier(puzzle.difficulty),
        solveRate: puzzle.solveRate ?? null,
        solutions: null
      }
    });
  }
  console.log('Cached puzzles in SQLite.');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
