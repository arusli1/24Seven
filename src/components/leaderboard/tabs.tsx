'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '../ui/card';

interface Entry {
  id: number;
  nickname: string;
  puzzlesSolved: number;
  timeLimit: number;
  averageSolveMs: number;
  createdAt: string;
}

const TIME_LIMITS = [60, 120, 300];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LeaderboardTabs() {
  const [active, setActive] = useState(60);
  const { data, isLoading } = useSWR<Entry[]>(
    `/api/leaderboard?mode=speedrun&limit=50&timeLimit=${active}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap justify-center gap-3">
        {TIME_LIMITS.map((limit) => (
          <button
            key={limit}
            onClick={() => setActive(limit)}
            className={`rounded-lg px-5 py-3 text-base font-medium transition-all sm:text-lg ${
              active === limit
                ? 'bg-[rgb(var(--accent))] text-black'
                : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {limit}s
          </button>
        ))}
      </div>
      <div className="mt-6">
        {isLoading && <p className="text-sm text-zinc-400">Loading…</p>}
        {!isLoading && (
          <ol className="space-y-2">
            {data?.map((entry, index) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
              >
                <div>
                  <p className="text-lg font-medium text-white">
                    #{index + 1} {entry.nickname}
                  </p>
                  <p className="text-sm text-zinc-400 sm:text-base">
                    Solved {entry.puzzlesSolved} • Avg {(entry.averageSolveMs / 1000).toFixed(2)}s
                  </p>
                </div>
                <span className="text-sm text-zinc-500">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
            {(!data || data.length === 0) && (
              <p className="py-8 text-center text-sm text-zinc-400">No entries yet.</p>
            )}
          </ol>
        )}
      </div>
    </Card>
  );
}
