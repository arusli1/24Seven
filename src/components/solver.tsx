'use client';

import { useState } from 'react';
import { findAllSolutions } from '@/lib/solver';

export function Solver() {
  const [nums, setNums] = useState<[number, number, number, number]>([1, 2, 3, 4]);
  const [solutions, setSolutions] = useState<string[] | null>(null);

  const solve = () => {
    const result = findAllSolutions([...nums]);
    setSolutions(result);
  };

  const setNum = (i: number, v: number) => {
    const n = Math.max(1, Math.min(13, Math.round(v)));
    setNums((prev) => {
      const next = [...prev] as [number, number, number, number];
      next[i] = n;
      return next;
    });
    setSolutions(null);
  };

  return (
    <div className="game24-game-inner">
      <p className="game24-solver-desc">Enter 4 numbers (1–13), get all solutions.</p>
      <div className="game24-solver-grid">
        {nums.map((n, i) => (
          <input
            key={i}
            type="number"
            min={1}
            max={13}
            value={n}
            onChange={(e) => setNum(i, Number(e.target.value) || 1)}
            className="game24-solver-input"
          />
        ))}
      </div>
      <button onClick={solve} className="game24-btn game24-btn-primary game24-solver-btn">
        Solve
      </button>
      <div className="game24-solver-output">
        {solutions === null ? (
          <span className="game24-solver-placeholder">Click Solve to find solutions</span>
        ) : solutions.length === 0 ? (
          <span className="game24-solver-none">No solutions found</span>
        ) : (
          <ul className="game24-solver-list">
            {solutions.map((expr, i) => (
              <li key={i}>{expr.replace(/\*/g, '×').replace(/\//g, '÷')}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
