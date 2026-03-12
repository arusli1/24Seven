'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puzzle } from '@/lib/types';
import { getHints } from '@/lib/solver';
import { Rational } from '@/lib/rational';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Props {
  puzzles: Puzzle[];
}

type Operator = '+' | '-' | '*' | '/';

const OPERATORS: { op: Operator; symbol: string }[] = [
  { op: '+', symbol: '+' },
  { op: '-', symbol: '−' },
  { op: '*', symbol: '×' },
  { op: '/', symbol: '÷' },
];

interface CardState {
  id: string;
  value: Rational;
  label: string;
  expression: string;
}

const TARGET = new Rational(24, 1);

function createCards(numbers: number[]): CardState[] {
  return numbers.map((num, index) => ({
    id: `${num}-${index}-${Math.random().toString(16).slice(2)}`,
    value: Rational.fromInteger(num),
    label: num.toString(),
    expression: num.toString()
  }));
}

function combineValues(a: Rational, b: Rational, operator: Operator) {
  switch (operator) {
    case '+':
      return a.add(b);
    case '-':
      return a.sub(b);
    case '*':
      return a.mul(b);
    case '/':
      return a.div(b);
    default:
      return a;
  }
}

export function PlayClient({ puzzles }: Props) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [cards, setCards] = useState<CardState[]>([]);
  const [history, setHistory] = useState<CardState[][]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [message, setMessage] = useState('');
  const [visibleHints, setVisibleHints] = useState(0);

  const hasPuzzles = puzzles.length > 0;
  const currentPuzzle = hasPuzzles ? puzzles[puzzleIndex % puzzles.length] : null;

  useEffect(() => {
    if (!currentPuzzle) return;
    setCards(createCards(currentPuzzle.numbers));
    setHistory([]);
    setSelectedCard(null);
    setOperator(null);
    setMessage('');
    setVisibleHints(0);
  }, [currentPuzzle]);

  const hints = useMemo(() => (currentPuzzle ? getHints(currentPuzzle.numbers) : []), [currentPuzzle]);
  const solved = cards.length === 1 && cards[0].value.equals(TARGET);

  const handleCardClick = (id: string) => {
    if (!operator) {
      setSelectedCard(id);
      setMessage('');
      return;
    }
    if (!selectedCard || selectedCard === id) {
      setSelectedCard(id);
      return;
    }
    combineCards(selectedCard, id, operator);
  };

  const combineCards = (firstId: string, secondId: string, op: Operator) => {
    const first = cards.find((card) => card.id === firstId);
    const second = cards.find((card) => card.id === secondId);
    if (!first || !second) return;

    try {
      const resultValue = combineValues(first.value, second.value, op);
      const nextCards = cards.filter((card) => card.id !== firstId && card.id !== secondId);
      const newCard: CardState = {
        id: `${Date.now()}`,
        value: resultValue,
        label: resultValue.toString(),
        expression: `(${first.expression} ${op} ${second.expression})`
      };
      setHistory((prev) => [...prev, cards]);
      setCards([...nextCards, newCard]);
      setSelectedCard(null);
      setOperator(null);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Invalid move.');
      setOperator(null);
      setSelectedCard(null);
    }
  };

  const undoLast = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy.pop()!;
      setCards(last);
      setSelectedCard(null);
      setOperator(null);
      setMessage('');
      return copy;
    });
  };

  if (!currentPuzzle) {
    return <p className="text-center text-rose-400">No puzzles. Run <code className="text-rose-300">npm run import:difficulties</code></p>;
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      <Card className="w-full border-border/50 bg-card/50 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-center gap-4 pb-4">
          <Button variant="outline" size="lg" onClick={() => setPuzzleIndex((prev) => prev + 1)}>
            New
          </Button>
          <Button variant="ghost" size="lg" onClick={undoLast} disabled={history.length === 0}>
            Undo
          </Button>
          <Button variant="outline" size="lg" onClick={() => setVisibleHints((p) => Math.min(p + 1, hints.length))} disabled={visibleHints >= hints.length}>
            Hint
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Number cards - bigger, centered, card-like */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`flex h-24 w-20 flex-col items-center justify-center rounded-2xl border-2 shadow-lg transition-all duration-200 active:scale-95 sm:h-28 sm:w-24 ${
                  selectedCard === card.id
                    ? 'border-primary bg-primary/20 shadow-lg'
                    : solved && cards[0].id === card.id
                      ? 'border-emerald-500/60 bg-emerald-500/20 shadow-emerald-500/20'
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                }`}
              >
                <span className="text-4xl font-bold text-foreground sm:text-5xl">{card.label}</span>
                {card.expression !== card.label && (
                  <span className="mt-1 font-mono text-xs text-muted-foreground">{card.expression}</span>
                )}
              </button>
            ))}
          </div>

          {/* Operator buttons - prominent */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {OPERATORS.map(({ op, symbol }) => (
              <Button
                key={op}
                variant={operator === op ? 'default' : 'outline'}
                size="lg"
                className="h-14 min-w-[4rem] text-2xl"
                onClick={() => {
                  if (!selectedCard) return;
                  setOperator(op);
                }}
              >
                {symbol}
              </Button>
            ))}
          </div>

          {message && <p className="text-center text-sm text-destructive">{message}</p>}
          {solved && (
            <p className="text-center text-lg font-medium text-emerald-400">
              ✓ {history.length + 1} steps
            </p>
          )}
        </CardContent>
      </Card>

      {visibleHints > 0 && (
        <Card className="w-full max-w-2xl border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {hints.slice(0, visibleHints).map((hint, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-mono text-xs">{hint.expression}</span>
                  — {hint.description}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
