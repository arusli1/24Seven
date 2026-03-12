'use client';

import { useState } from 'react';
import { Game } from '@/components/game';
import { Solver } from '@/components/solver';
import { Puzzle } from '@/lib/types';

export function ModeSwitcher({ puzzles }: { puzzles: Puzzle[] }) {
  const [mode, setMode] = useState<'play' | 'solver'>('play');

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
          onClick={() => setMode('solver')}
          className={`game24-tab ${mode === 'solver' ? 'active' : ''}`}
        >
          Solver
        </button>
      </div>
      {mode === 'play' ? <Game puzzles={puzzles} /> : <Solver />}
    </>
  );
}
