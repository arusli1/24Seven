'use client';

import { useState } from 'react';
import { findAllSolutions } from '@/lib/solver';

export function Solver() {
  const [inputs, setInputs] = useState<string[]>(['1', '2', '3', '4']);
  const [solutions, setSolutions] = useState<string[] | null>(null);

  const solve = () => {
    const nums = inputs.map((s) => Math.max(0, Math.round(Number(s) || 0)));
    const result = findAllSolutions(nums);
    setSolutions(result);
  };

  const setInput = (i: number, v: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    setSolutions(null);
  };

  return (
    <div className="game24-game-inner">
      <p className="game24-solver-desc">Enter any 4 numbers, get all solutions.</p>
      <div className="game24-solver-grid">
        {inputs.map((val, i) => (
          <input
            key={i}
            type="number"
            min={0}
            value={val}
            placeholder=""
            onChange={(e) => setInput(i, e.target.value)}
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
