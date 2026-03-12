import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/server/rate-limit';
import { z } from 'zod';

const entrySchema = z.object({
  mode: z.literal('speedrun'),
  nickname: z.string().min(1).max(32),
  timeLimit: z.number().int().positive(),
  puzzlesSolved: z.number().int().nonnegative(),
  totalAttempts: z.number().int().nonnegative(),
  invalidAttempts: z.number().int().nonnegative(),
  averageSolveMs: z.number().int().nonnegative()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 50);
  const timeLimit = Number(searchParams.get('timeLimit') ?? 60);
  const entries = await prisma.leaderboardEntry.findMany({
    where: { mode: 'speedrun', timeLimit },
    orderBy: [
      { puzzlesSolved: 'desc' },
      { averageSolveMs: 'asc' },
      { createdAt: 'asc' }
    ],
    take: limit
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many submissions. Try again soon.' }, { status: 429 });
  }
  const data = await request.json();
  const parsed = entrySchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const entry = await prisma.leaderboardEntry.create({
    data: parsed.data
  });
  return NextResponse.json(entry, { status: 201 });
}
