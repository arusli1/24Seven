'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle } from '@/lib/types';
import { Rational } from '@/lib/rational';
import { pushRecent } from '@/lib/puzzle-select';
import { solvePuzzle } from '@/lib/solver';

type Operator = '+' | '-' | '*' | '/';

const OPS: { op: Operator; sym: string }[] = [
  { op: '+', sym: '+' },
  { op: '-', sym: '−' },
  { op: '*', sym: '×' },
  { op: '/', sym: '÷' },
];

const OP_SYM: Record<Operator, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };

interface CardState {
  id: string;
  value: Rational;
  label: string;
  expr: string;
}

const TARGET = new Rational(24, 1);

function makeCards(ns: number[]): CardState[] {
  return ns.map((n, i) => ({
    id: `${n}-${i}-${Math.random().toString(36).slice(2)}`,
    value: Rational.fromInteger(n),
    label: n.toString(),
    expr: n.toString(),
  }));
}

function combine(a: Rational, b: Rational, op: Operator): Rational {
  switch (op) {
    case '+': return a.add(b);
    case '-': return a.sub(b);
    case '*': return a.mul(b);
    case '/': return a.div(b);
  }
}

/** Pick puzzle with bias: 0 = prefer easy (high solve rate), 1 = prefer hard (low solve rate) */
function pickWeightedPuzzle(puzzles: Puzzle[], bias: number, excludeIds: string[]): Puzzle {
  let pool = puzzles.filter((p) => !excludeIds.includes(p.id));
  if (pool.length === 0) return puzzles[Math.floor(Math.random() * puzzles.length)];
  const sr = (p: Puzzle) => p.solveRate ?? 0.5;
  // When bias is high, only allow low solve-rate puzzles (hard = actually hard)
  const maxSolveRate = bias >= 0.8 ? 0.35 : bias >= 0.6 ? 0.5 : bias >= 0.4 ? 0.65 : 1;
  const hardPool = pool.filter((p) => sr(p) <= maxSolveRate);
  if (hardPool.length > 0) pool = hardPool;
  const weights = pool.map((p) => (1 - bias) * sr(p) + bias * (1 - sr(p)));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

const MAX_PREV_HISTORY = 20;

export function Game({ puzzles }: { puzzles: Puzzle[] }) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [prevHistory, setPrevHistory] = useState<Puzzle[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [cards, setCards] = useState<CardState[]>([]);
  const [hist, setHist] = useState<CardState[][]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [op, setOp] = useState<Operator | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [difficultyBias, setDifficultyBias] = useState(0.5); // 0 = easy, 1 = hard
  const [elapsedSec, setElapsedSec] = useState(0);
  const peekedRef = useRef(false);

  const loadNewPuzzle = useCallback(() => {
    if (puzzles.length === 0) return;
    setPrevHistory((h) => (puzzle ? [...h.slice(-MAX_PREV_HISTORY + 1), puzzle] : h));
    const next = pickWeightedPuzzle(puzzles, difficultyBias, recentIds);
    setPuzzle(next);
    setRecentIds((prev) => pushRecent(prev, next.id));
    setShowSolution(false);
  }, [puzzles, difficultyBias, recentIds, puzzle]);

  const goPrevPuzzle = useCallback(() => {
    if (prevHistory.length === 0) return;
    setPrevHistory((h) => h.slice(0, -1));
    setPuzzle(prevHistory[prevHistory.length - 1]);
    setShowSolution(false);
  }, [prevHistory]);

  useEffect(() => {
    if (puzzles.length > 0 && !puzzle) loadNewPuzzle();
  }, [puzzles.length, puzzle, loadNewPuzzle]);

  useEffect(() => {
    if (!puzzle) return;
    const start = Date.now();
    setElapsedSec(0);
    const t = setInterval(() => setElapsedSec(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [puzzle]);

  useEffect(() => {
    if (!puzzle) return;
    setCards(makeCards(puzzle.numbers));
    setHist([]);
    setSel(null);
    setOp(null);
    setShowSolution(false);
    peekedRef.current = false;
  }, [puzzle]);

  // Mark as peeked whenever solution is shown (reliable - runs after render)
  useEffect(() => {
    if (showSolution) peekedRef.current = true;
  }, [showSolution]);

  const solved = cards.length === 1 && cards[0].value.equals(TARGET);

  // Auto-load next puzzle when solved
  useEffect(() => {
    if (!solved) return;
    const t = setTimeout(loadNewPuzzle, 500);
    return () => clearTimeout(t);
  }, [solved, loadNewPuzzle]);

  const solutionExpr = puzzle
    ? (puzzle.solutions?.[0] ?? solvePuzzle(puzzle.numbers)?.expression)
    : null;

  const onCard = (id: string) => {
    if (!op) {
      setSel(id);
      return;
    }
    if (!sel || sel === id) {
      setSel(id);
      return;
    }
    const a = cards.find((c) => c.id === sel)!;
    const b = cards.find((c) => c.id === id)!;
    try {
      const v = combine(a.value, b.value, op);
      setHist((h) => [...h, cards]);
      const newCard = {
        id: `${Date.now()}`,
        value: v,
        label: v.toString(),
        expr: `(${a.expr} ${OP_SYM[op]} ${b.expr})`,
      };
      setCards(cards.filter((c) => c.id !== sel && c.id !== id).concat(newCard));
      setSel(newCard.id);
      setOp(null);
    } catch {
      setOp(null);
      setSel(null);
    }
  };

  const undo = () => {
    if (hist.length === 0) return;
    const prev = hist[hist.length - 1];
    setHist(hist.slice(0, -1));
    setCards(prev);
    setSel(null);
    setOp(null);
  };

  if (!puzzle) {
    return <p style={{ textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>No puzzles.</p>;
  }

  return (
    <div className="game24-game-inner">
      <div className="game24-difficulty">
        <label htmlFor="difficulty-slider" className="game24-difficulty-label">
          Difficulty
        </label>
        <div className="game24-difficulty-row">
          <span className="game24-difficulty-min">Easy</span>
          <input
            id="difficulty-slider"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={difficultyBias}
            onChange={(e) => setDifficultyBias(Number(e.target.value))}
            className="game24-slider"
          />
          <span className="game24-difficulty-max">Hard</span>
        </div>
      </div>
      <div className="game24-stats">
        {puzzle.solveRate != null && (
          <span className="game24-solve-rate">
            {(puzzle.solveRate * 100).toFixed(1)}% solve rate
          </span>
        )}
        <span className="game24-timer">
          {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')}
        </span>
      </div>
      <div className="game24-actions">
        <button
          onClick={goPrevPuzzle}
          disabled={prevHistory.length === 0}
          className="game24-btn game24-btn-nav"
          title="Previous puzzle"
        >
          ‹
        </button>
        <button
          onClick={loadNewPuzzle}
          className="game24-btn game24-btn-primary"
          title="Next puzzle"
        >
          ›
        </button>
        <button
          onClick={() => setShowSolution((s) => !s)}
          className="game24-btn game24-btn-secondary"
          title={showSolution ? 'Hide solution' : 'Show solution (won\'t count as solve)'}
        >
          {showSolution ? 'Hide' : 'Solution'}
        </button>
        <button
          onClick={undo}
          disabled={hist.length === 0}
          className="game24-btn game24-btn-secondary"
        >
          Undo
        </button>
      </div>

      {showSolution && solutionExpr && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="game24-solution"
        >
          {solutionExpr.replace(/\*/g, '×').replace(/\//g, '÷')}
        </motion.p>
      )}

      <div className="game24-grid">
        <AnimatePresence mode="popLayout">
          {cards.map((c) => (
            <motion.button
              key={c.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={() => onCard(c.id)}
              className={`game24-num-card ${sel === c.id ? 'selected' : ''} ${solved && cards[0].id === c.id ? 'solved' : ''}`}
            >
              {c.value.denominator === 1 ? (
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{c.value.numerator}</span>
              ) : (
                <span className="game24-fraction">
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{c.value.numerator}</span>
                  <span className="game24-fraction-bar" />
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{c.value.denominator}</span>
                </span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="game24-ops">
        {OPS.map(({ op: o, sym }) => (
          <button
            key={o}
            onClick={() => sel && setOp(o)}
            className={`game24-op ${op === o ? 'selected' : ''}`}
          >
            {sym}
          </button>
        ))}
      </div>

    </div>
  );
}
