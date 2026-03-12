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
      <div className="flex flex-wrap gap-2">
        {TIME_LIMITS.map((limit) => (
          <button
            key={limit}
            onClick={() => setActive(limit)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              active === limit
                ? 'bg-[rgb(var(--accent))] text-white shadow-panel'
                : 'bg-[rgb(var(--bg-base))] text-[rgb(var(--ink-muted))] hover:bg-[rgb(var(--border))]/50'
            }`}
          >
            {limit}s
          </button>
        ))}
      </div>
      <div className="mt-6">
        {isLoading && <p className="text-sm text-[rgb(var(--ink-muted))]">Loading…</p>}
        {!isLoading && (
          <ol className="space-y-2">
            {data?.map((entry, index) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))]/40 bg-[rgb(var(--bg-base))]/60 px-4 py-3 transition-colors hover:bg-[rgb(var(--accent-soft))]/30"
              >
                <div>
                  <p className="font-semibold text-[rgb(var(--ink))]">
                    #{index + 1} {entry.nickname}
                  </p>
                  <p className="text-xs text-[rgb(var(--ink-muted))]">
                    Solved {entry.puzzlesSolved} • Avg {(entry.averageSolveMs / 1000).toFixed(2)}s
                  </p>
                </div>
                <span className="text-xs text-[rgb(var(--ink-subtle))]">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
            {(!data || data.length === 0) && (
              <p className="py-8 text-center text-sm text-[rgb(var(--ink-muted))]">No entries yet.</p>
            )}
          </ol>
        )}
      </div>
    </Card>
  );
}
