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
  const maxSolveRate = bias >= 0.8 ? 0.35 : bias >= 0.6 ? 0.5 : bias >= 0.4 ? 0.65 : 1;
  const hardPool = pool.filter((p) => (p.custom && bias >= 0.5) || sr(p) <= maxSolveRate);
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
  const [difficultyBias, setDifficultyBias] = useState(1);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [sessionSolved, setSessionSolved] = useState(0);
  const [sessionPeeked, setSessionPeeked] = useState(0);
  const [solvedInfo, setSolvedInfo] = useState<{ expr: string; sec: number } | null>(null);
  const peekedRef = useRef(false);
  const solvedFiredRef = useRef(false);

  const loadNewPuzzle = useCallback(() => {
    if (puzzles.length === 0) return;
    setPrevHistory((h) => (puzzle ? [...h.slice(-MAX_PREV_HISTORY + 1), puzzle] : h));
    const next = pickWeightedPuzzle(puzzles, difficultyBias, recentIds);
    setPuzzle(next);
    setRecentIds((prev) => pushRecent(prev, next.id));
    setShowSolution(false);
    setSolvedInfo(null);
    solvedFiredRef.current = false;
  }, [puzzles, difficultyBias, recentIds, puzzle]);

  const goPrevPuzzle = useCallback(() => {
    if (prevHistory.length === 0) return;
    setPrevHistory((h) => h.slice(0, -1));
    setPuzzle(prevHistory[prevHistory.length - 1]);
    setShowSolution(false);
    setSolvedInfo(null);
    solvedFiredRef.current = false;
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

  useEffect(() => {
    if (showSolution) peekedRef.current = true;
  }, [showSolution]);

  const solved = cards.length === 1 && cards[0].value.equals(TARGET);

  // Detect solve: show banner, update session stats, then auto-advance
  useEffect(() => {
    if (!solved || solvedFiredRef.current) return;
    solvedFiredRef.current = true;
    const expr = cards[0].expr;
    setSolvedInfo({ expr, sec: elapsedSec });
    if (peekedRef.current) {
      setSessionPeeked((n) => n + 1);
    } else {
      setSessionSolved((n) => n + 1);
    }
    const t = setTimeout(loadNewPuzzle, 1800);
    return () => clearTimeout(t);
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Keyboard shortcuts — stable ref pattern to avoid stale closures
  const handlerRef = useRef<(e: KeyboardEvent) => void>(null!);
  handlerRef.current = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const key = e.key.toLowerCase();
    // 1-4: select card by position
    if (['1', '2', '3', '4'].includes(key)) {
      const idx = parseInt(key) - 1;
      if (cards[idx]) setSel(cards[idx].id);
      return;
    }
    // operators
    if (key === '+') { if (sel) setOp('+'); return; }
    if (key === '-') { if (sel) setOp('-'); return; }
    if (key === '*' || key === 'x') { if (sel) setOp('*'); return; }
    if (key === '/') { e.preventDefault(); if (sel) setOp('/'); return; }
    // undo
    if (key === 'u') { undo(); return; }
    // next / prev
    if (key === 'n') { loadNewPuzzle(); return; }
    if (key === 'p') { goPrevPuzzle(); return; }
    // deselect
    if (e.key === 'Escape') { setSel(null); setOp(null); return; }
  };

  useEffect(() => {
    const fn = (e: KeyboardEvent) => handlerRef.current(e);
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  if (!puzzle) {
    return <p className="game24-empty">No puzzles.</p>;
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
        <span className="game24-solve-rate">
          {puzzle.custom ? 'Solve rate N/A' : puzzle.solveRate != null ? `${(puzzle.solveRate * 100).toFixed(1)}% solve rate` : 'Solve rate N/A'}
        </span>
        <span className="game24-timer">
          {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')}
        </span>
        {(sessionSolved > 0 || sessionPeeked > 0) && (
          <span className="game24-session-stats">
            {sessionSolved} solved{sessionPeeked > 0 ? ` · ${sessionPeeked} peeked` : ''}
          </span>
        )}
      </div>
      <div className="game24-actions">
        <button
          onClick={goPrevPuzzle}
          disabled={prevHistory.length === 0}
          className="game24-btn game24-btn-nav"
          title="Previous puzzle (P)"
        >
          ‹
        </button>
        <button
          onClick={loadNewPuzzle}
          className="game24-btn game24-btn-primary"
          title="Next puzzle (N)"
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
          title="Undo (U)"
        >
          Undo
        </button>
      </div>

      {showSolution && solutionExpr && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="game24-solution"
        >
          {solutionExpr.replace(/\*/g, '×').replace(/\//g, '÷')}
        </motion.p>
      )}

      <AnimatePresence>
        {solvedInfo && (
          <motion.div
            key="solved-banner"
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="game24-solved-banner"
          >
            <span className="game24-solved-banner-emoji">🎉</span>
            <span className="game24-solved-banner-expr">
              {solvedInfo.expr.replace(/\*/g, '×').replace(/\//g, '÷')}
            </span>
            <span className="game24-solved-banner-time">
              {Math.floor(solvedInfo.sec / 60)}:{String(solvedInfo.sec % 60).padStart(2, '0')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="game24-grid">
        <AnimatePresence mode="popLayout">
          {cards.map((c) => (
            <motion.button
              key={c.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
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
