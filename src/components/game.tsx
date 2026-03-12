'use client';

import { useEffect, useState } from 'react';
import { Puzzle } from '@/lib/types';
import { Rational } from '@/lib/rational';

type Operator = '+' | '-' | '*' | '/';

const OPS: { op: Operator; sym: string }[] = [
  { op: '+', sym: '+' },
  { op: '-', sym: '−' },
  { op: '*', sym: '×' },
  { op: '/', sym: '÷' },
];

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
        expr: `(${a.expr} ${op} ${b.expr})`,
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
    <div className="flex w-full max-w-sm flex-col items-center gap-8 sm:max-w-md">
      {/* Numbers */}
      <div className="flex flex-wrap justify-center gap-4">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onCard(c.id)}
            className={
              'flex h-20 w-16 flex-col items-center justify-center rounded-2xl transition-all duration-200 ease-out active:scale-[0.98] sm:h-24 sm:w-20 ' +
              (sel === c.id
                ? 'scale-105 border-2 border-primary bg-primary/10'
                : solved && cards[0].id === c.id
                  ? 'border-2 border-emerald-500/50 bg-emerald-500/10'
                  : 'border border-border/50 bg-card/30 hover:border-border hover:bg-card/50' + (sel ? ' hover:border-primary/40' : ''))
            }
          >
            <span className="text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
              {c.label}
            </span>
            {c.expr !== c.label && (
              <span className="mt-0.5 font-mono text-[10px] text-muted-foreground sm:text-xs">
                {c.expr}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Operators */}
      <div className="flex gap-3">
        {OPS.map(({ op: o, sym }) => (
          <button
            key={o}
            onClick={() => sel && setOp(o)}
            className={
              'h-12 w-12 rounded-xl text-xl font-medium transition-all duration-200 active:scale-95 sm:h-14 sm:w-14 sm:text-2xl ' +
              (op === o ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground')
            }
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setIdx((i) => i + 1)}
          className="rounded-xl border border-border/50 bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-border hover:text-foreground active:scale-95"
        >
          New
        </button>
        <button
          onClick={undo}
          disabled={hist.length === 0}
          className="rounded-xl border border-border/50 bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-border hover:text-foreground active:scale-95 disabled:opacity-40 disabled:active:scale-100"
        >
          Undo
        </button>
      </div>

      {solved && (
        <p className="text-sm text-emerald-500 transition-opacity duration-300">
          {hist.length + 1} steps
        </p>
      )}
    </div>
  );
}
