'use client';

import { useState } from 'react';
import { Game } from '@/components/game';
import { DailyGame } from '@/components/daily-game';
import { Solver } from '@/components/solver';
import { Puzzle } from '@/lib/types';

type Tab = 'play' | 'daily' | 'solver';

export function ModeSwitcher({ puzzles }: { puzzles: Puzzle[] }) {
  const [mode, setMode] = useState<Tab>('play');

  return (
    <>
      <div className="game24-tabs">
        <button
          onClick={() => setMode('play')}
          className={`game24-tab ${mode === 'play' ? 'active' : ''}`}
        >
          Play
        </button>
        <button
          onClick={() => setMode('daily')}
          className={`game24-tab ${mode === 'daily' ? 'active' : ''}`}
        >
          Daily
        </button>
        <button
          onClick={() => setMode('solver')}
          className={`game24-tab ${mode === 'solver' ? 'active' : ''}`}
        >
          Solver
        </button>
      </div>
      {mode === 'play' && <Game puzzles={puzzles} />}
      {mode === 'daily' && <DailyGame puzzles={puzzles} />}
      {mode === 'solver' && <Solver />}
    </>
  );
}
