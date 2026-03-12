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

  const cardStyle =
    'game-card flex flex-col items-center justify-center rounded-3xl px-4 transition-all duration-200 ';
  const cardDefault =
    'bg-zinc-800 text-white border-2 border-zinc-600 shadow-xl hover:bg-zinc-700 hover:border-zinc-500 active:scale-[0.98] ';
  const cardSelected =
    'bg-amber-500 text-black border-2 border-amber-400 shadow-2xl ring-4 ring-amber-400/40 ';
  const cardSolved =
    'bg-emerald-600 text-white border-2 border-emerald-400 shadow-2xl ';

  const opStyle =
    'game-op flex items-center justify-center rounded-3xl font-bold transition-all duration-200 ';
  const opDefault =
    'bg-zinc-800 text-zinc-200 border-2 border-zinc-600 shadow-xl hover:bg-zinc-700 hover:text-white hover:border-zinc-500 active:scale-[0.96] ';
  const opSelected =
    'bg-amber-500 text-black border-2 border-amber-400 shadow-2xl ';

  const actionStyle =
    'game-action rounded-3xl font-bold transition-all duration-200 ';
  const actionDefault =
    'bg-zinc-800 text-white border-2 border-zinc-600 shadow-xl hover:bg-zinc-700 hover:border-zinc-500 active:scale-[0.98] ';
  const actionDisabled =
    'opacity-50 cursor-not-allowed hover:bg-zinc-800 hover:border-zinc-600 ';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex w-full flex-col items-center gap-10 sm:gap-12"
    >
      {/* Numbers - centered grid */}
      <section className="flex w-full flex-col items-center">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
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
                className={
                  cardStyle +
                  (sel === c.id
                    ? cardSelected
                    : solved && cards[0].id === c.id
                      ? cardSolved
                      : cardDefault + (sel ? ' hover:border-amber-500/60' : ''))
                }
              >
                {c.value.denominator === 1 ? (
                  <span className="font-display text-[clamp(2.5rem,8vmin,5rem)] font-bold tabular-nums">
                    {c.value.numerator}
                  </span>
                ) : (
                  <span className="flex flex-col items-center">
                    <span className="font-display text-[clamp(2rem,6vmin,4rem)] font-bold tabular-nums">
                      {c.value.numerator}
                    </span>
                    <span className="my-1 w-full border-b-2 border-current opacity-80" />
                    <span className="font-display text-[clamp(2rem,6vmin,4rem)] font-bold tabular-nums">
                      {c.value.denominator}
                    </span>
                  </span>
                )}
                {c.expr !== c.label && (
                  <span className="mt-2 max-w-full break-words text-center font-mono text-[clamp(0.6rem,1.5vmin,0.9rem)] text-zinc-400">
                    {c.expr}
                  </span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Operators - centered row */}
      <section className="flex w-full flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {OPS.map(({ op: o, sym }) => (
            <motion.button
              key={o}
              onClick={() => sel && setOp(o)}
              whileTap={{ scale: 0.95 }}
              className={opStyle + (op === o ? opSelected : opDefault)}
            >
              {sym}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Actions - centered row */}
      <section className="flex w-full flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <motion.button
            onClick={loadNewPuzzle}
            whileTap={{ scale: 0.97 }}
            className={actionStyle + actionDefault}
          >
            New
          </motion.button>
          <motion.button
            onClick={undo}
            disabled={hist.length === 0}
            whileTap={hist.length > 0 ? { scale: 0.97 } : {}}
            className={
              actionStyle +
              (hist.length === 0 ? actionDisabled : actionDefault)
            }
          >
            Undo
          </motion.button>
        </div>
      </section>

      <AnimatePresence>
        {solved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-3xl bg-emerald-600 px-10 py-5 shadow-xl"
          >
            <p className="font-display text-2xl font-bold text-white">
              {hist.length + 1} steps
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
