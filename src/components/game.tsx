'use client';

import { useEffect, useState, useCallback } from 'react';
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

export function Game({ puzzles }: { puzzles: Puzzle[] }) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [cards, setCards] = useState<CardState[]>([]);
  const [hist, setHist] = useState<CardState[][]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [op, setOp] = useState<Operator | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const loadNewPuzzle = useCallback(() => {
    if (puzzles.length === 0) return;
    const next = puzzles[Math.floor(Math.random() * puzzles.length)];
    setPuzzle(next);
    setRecentIds((prev) => pushRecent(prev, next.id));
    setShowSolution(false);
  }, [puzzles]);

  useEffect(() => {
    if (puzzles.length > 0 && !puzzle) loadNewPuzzle();
  }, [puzzles.length, puzzle, loadNewPuzzle]);

  useEffect(() => {
    if (!puzzle) return;
    setCards(makeCards(puzzle.numbers));
    setHist([]);
    setSel(null);
    setOp(null);
    setShowSolution(false);
  }, [puzzle]);

  const solved = cards.length === 1 && cards[0].value.equals(TARGET);

  // Auto-load next puzzle when solved (speed game)
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
      <div className="game24-actions">
        <button onClick={loadNewPuzzle} className="game24-btn game24-btn-primary">
          New Game
        </button>
        <button
          onClick={undo}
          disabled={hist.length === 0}
          className="game24-btn game24-btn-secondary"
        >
          Undo
        </button>
        <button
          onClick={() => setShowSolution((s) => !s)}
          className="game24-btn game24-btn-secondary"
          title={showSolution ? 'Hide solution' : 'Show solution'}
        >
          {showSolution ? 'Hide' : 'Solution'}
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
