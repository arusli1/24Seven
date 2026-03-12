'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle } from '@/lib/types';
import { Rational } from '@/lib/rational';

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
  const [idx, setIdx] = useState(0);
  const [cards, setCards] = useState<CardState[]>([]);
  const [hist, setHist] = useState<CardState[][]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [op, setOp] = useState<Operator | null>(null);

  const puzzle = puzzles[idx % puzzles.length] ?? puzzles[0];

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
    return <p className="text-muted-foreground text-sm">No puzzles.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex w-full max-w-2xl flex-col items-center justify-center gap-10 sm:gap-14"
    >
      {/* Numbers */}
      <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
        <AnimatePresence mode="popLayout">
          {cards.map((c) => (
            <motion.button
              key={c.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => onCard(c.id)}
              className={
                'flex min-h-[5.5rem] min-w-[4.5rem] flex-col items-center justify-center rounded-2xl px-2 transition-colors duration-200 sm:min-h-[6.5rem] sm:min-w-[5.5rem] md:min-h-[7rem] md:min-w-[6rem] ' +
                (sel === c.id
                  ? 'scale-105 border-2 border-primary bg-primary/15 shadow-lg'
                  : solved && cards[0].id === c.id
                    ? 'border-2 border-emerald-500/50 bg-emerald-500/15 shadow-lg'
                    : 'border border-border/50 bg-card/40 hover:border-border hover:bg-card/60' + (sel ? ' hover:border-primary/50' : ''))
              }
              whileTap={{ scale: 0.97 }}
            >
              {c.value.denominator === 1 ? (
                <span className="text-4xl font-semibold tabular-nums text-foreground sm:text-5xl md:text-6xl">
                  {c.value.numerator}
                </span>
              ) : (
                <span className="flex flex-col items-center leading-tight">
                  <span className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl md:text-4xl">
                    {c.value.numerator}
                  </span>
                  <span className="my-0.5 w-full border-t-2 border-foreground/80" />
                  <span className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl md:text-4xl">
                    {c.value.denominator}
                  </span>
                </span>
              )}
              {c.expr !== c.label && (
                <span className="mt-1.5 font-mono text-[10px] text-muted-foreground sm:text-xs">
                  {c.expr}
                </span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Operators */}
      <div className="flex gap-4 sm:gap-6">
        {OPS.map(({ op: o, sym }) => (
          <motion.button
            key={o}
            onClick={() => sel && setOp(o)}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={
              'flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-medium transition-colors duration-200 sm:h-20 sm:w-20 sm:text-3xl md:h-24 md:w-24 md:text-4xl ' +
              (op === o ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground')
            }
          >
            {sym}
          </motion.button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-6">
        <motion.button
          onClick={() => setIdx((i) => i + 1)}
          whileTap={{ scale: 0.95 }}
          className="rounded-2xl border border-border/50 bg-transparent px-8 py-4 text-base font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground sm:text-lg"
        >
          New
        </motion.button>
        <motion.button
          onClick={undo}
          disabled={hist.length === 0}
          whileTap={hist.length > 0 ? { scale: 0.95 } : {}}
          className="rounded-2xl border border-border/50 bg-transparent px-8 py-4 text-base font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-40 disabled:hover:border-border/50 disabled:hover:text-muted-foreground sm:text-lg"
        >
          Undo
        </motion.button>
      </div>

      <AnimatePresence>
        {solved && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-medium text-emerald-500 sm:text-xl"
          >
            {hist.length + 1} steps
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
