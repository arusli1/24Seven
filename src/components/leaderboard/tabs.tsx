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
  const { data, isLoading } = useSWR<Entry[]>(`/api/leaderboard?mode=speedrun&limit=50&timeLimit=${active}`, fetcher, {
    refreshInterval: 30000
  });

  return (
    <Card>
      <div className="flex flex-wrap gap-3">
        {TIME_LIMITS.map((limit) => (
          <button
            key={limit}
            onClick={() => setActive(limit)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${active === limit ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {limit}s
          </button>
        ))}
      </div>
      <div className="mt-6">
        {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {!isLoading && (
          <ol className="space-y-2">
            {data?.map((entry, index) => (
              <li key={entry.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    #{index + 1} {entry.nickname}
                  </p>
                  <p className="text-xs text-slate-500">Solved {entry.puzzlesSolved} • Avg {(entry.averageSolveMs / 1000).toFixed(2)}s</p>
                </div>
                <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
            {(!data || data.length === 0) && <p className="text-sm text-slate-500">No entries yet.</p>}
          </ol>
        )}
      </div>
    </Card>
  );
}
