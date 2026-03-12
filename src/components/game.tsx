'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle } from '@/lib/types';
import { Rational } from '@/lib/rational';
import { selectNextPuzzle, pushRecent } from '@/lib/puzzle-select';

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

  const loadNewPuzzle = useCallback(() => {
    if (puzzles.length === 0) return;
    const next = selectNextPuzzle(puzzles, recentIds, 2);
    setPuzzle(next);
    setRecentIds((prev) => pushRecent(prev, next.id));
  }, [puzzles, recentIds]);

  useEffect(() => {
    if (puzzles.length > 0 && !puzzle) loadNewPuzzle();
  }, [puzzles.length, puzzle, loadNewPuzzle]);

  useEffect(() => {
    if (!puzzle) return;
    setCards(makeCards(puzzle.numbers));
    setHist([]);
    setSel(null);
    setOp(null);
  }, [puzzle]);

  const solved = cards.length === 1 && cards[0].value.equals(TARGET);

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
      setCards(cards.filter((c) => c.id !== sel && c.id !== id).concat({
        id: `${Date.now()}`,
        value: v,
        label: v.toString(),
        expr: `(${a.expr} ${OP_SYM[op]} ${b.expr})`,
      }));
      setSel(null);
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
    return <p className="text-zinc-400 text-sm">No puzzles.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center gap-10 sm:gap-12"
    >
      <section className="w-full">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90 sm:text-sm"
        >
          Your numbers
        </motion.h2>
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {cards.map((c, i) => (
              <motion.button
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.85, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28, delay: i * 0.03 }}
                onClick={() => onCard(c.id)}
                className={
                  'flex min-h-[8rem] min-w-[7rem] flex-col items-center justify-center rounded-2xl border px-3 transition-all duration-300 sm:min-h-[9rem] sm:min-w-[8rem] md:min-h-[10rem] md:min-w-[9rem] lg:min-h-[11rem] lg:min-w-[10rem] ' +
                  (sel === c.id
                    ? 'scale-105 border-2 border-amber-400 bg-amber-500/20 shadow-glow-amber ring-2 ring-amber-400/30'
                    : solved && cards[0].id === c.id
                      ? 'border-2 border-emerald-400/80 bg-emerald-500/15 shadow-lg shadow-emerald-500/20'
                      : 'border-white/[0.08] bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08]' + (sel ? ' hover:border-amber-400/40' : ''))
                }
                whileTap={{ scale: 0.97 }}
                whileHover={!sel && !solved ? { scale: 1.02 } : {}}
              >
                {c.value.denominator === 1 ? (
                  <span className="font-display text-5xl font-bold tabular-nums sm:text-6xl md:text-7xl lg:text-8xl">
                    {c.value.numerator}
                  </span>
                ) : (
                  <span className="flex flex-col items-center justify-center">
                    <span className="font-display text-4xl font-bold tabular-nums sm:text-5xl md:text-6xl lg:text-7xl">
                      {c.value.numerator}
                    </span>
                    <span className="my-1 w-full min-w-[2rem] border-b-2 border-white/80" />
                    <span className="font-display text-4xl font-bold tabular-nums sm:text-5xl md:text-6xl lg:text-7xl">
                      {c.value.denominator}
                    </span>
                  </span>
                )}
                {c.expr !== c.label && (
                  <span className="mt-2 max-w-full break-words px-1 text-center font-mono text-xs text-zinc-500 sm:text-sm">
                    {c.expr}
                  </span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="w-full">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90 sm:text-sm"
        >
          Operators
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-5 sm:gap-6 md:gap-8">
          {OPS.map(({ op: o, sym }, i) => (
            <motion.button
              key={o}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => sel && setOp(o)}
              whileTap={{ scale: 0.92 }}
              className={
                'flex h-20 w-20 items-center justify-center rounded-2xl border text-3xl font-medium transition-all duration-300 sm:h-24 sm:w-24 sm:text-4xl md:h-28 md:w-28 md:text-5xl lg:h-32 lg:w-32 lg:text-6xl ' +
                (op === o
                  ? 'border-amber-400 bg-amber-500 text-black shadow-glow-amber'
                  : 'border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white')
              }
            >
              {sym}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="w-full">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90 sm:text-sm"
        >
          Actions
        </motion.h2>
        <div className="flex justify-center gap-4 sm:gap-6">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={loadNewPuzzle}
            whileTap={{ scale: 0.95 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-10 py-5 text-lg font-medium text-white transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] sm:text-xl"
          >
            New
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={undo}
            disabled={hist.length === 0}
            whileTap={hist.length > 0 ? { scale: 0.95 } : {}}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-10 py-5 text-lg font-medium text-white transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-40 disabled:hover:border-white/[0.08] disabled:hover:bg-white/[0.04] sm:text-xl"
          >
            Undo
          </motion.button>
        </div>
      </section>

      <AnimatePresence>
        {solved && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-4"
          >
            <p className="font-display text-lg font-semibold text-emerald-400 sm:text-xl">
              {hist.length + 1} steps
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
