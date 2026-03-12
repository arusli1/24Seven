'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puzzle } from '@/lib/types';
import { getHints } from '@/lib/solver';
import { Rational } from '@/lib/rational';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  const [message, setMessage] = useState('Select a card to start.');
  const [visibleHints, setVisibleHints] = useState(0);

  const hasPuzzles = puzzles.length > 0;
  const currentPuzzle = hasPuzzles ? puzzles[puzzleIndex % puzzles.length] : null;

  useEffect(() => {
    if (!currentPuzzle) return;
    setCards(createCards(currentPuzzle.numbers));
    setHistory([]);
    setSelectedCard(null);
    setOperator(null);
    setMessage('Select a card to start.');
    setVisibleHints(0);
  }, [currentPuzzle]);

  const hints = useMemo(() => (currentPuzzle ? getHints(currentPuzzle.numbers) : []), [currentPuzzle]);
  const solved = cards.length === 1 && cards[0].value.equals(TARGET);

  const handleCardClick = (id: string) => {
    if (!operator) {
      setSelectedCard(id);
      setMessage('Pick an operator.');
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
      setMessage(cards.length === 2 && resultValue.equals(TARGET) ? 'That makes 24!' : 'Select the next card.');
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
      setMessage('Move undone.');
      return copy;
    });
  };

  if (!currentPuzzle) {
    return <p className="text-center text-lg text-rose-400">No puzzles. Run <code className="text-rose-300">npm run import:difficulties</code></p>;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center space-y-8">
      <Card className="w-full max-w-2xl space-y-8">
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="md" onClick={() => setPuzzleIndex((prev) => prev + 1)}>
            New puzzle
          </Button>
          <Button variant="ghost" size="md" onClick={undoLast} disabled={history.length === 0}>
            Undo
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 px-6 py-8 text-center transition-all duration-200 active:scale-[0.98] sm:px-8 sm:py-10 ${
                selectedCard === card.id
                  ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10'
                  : solved && cards[0].id === card.id
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.06]'
              }`}
            >
              <p className="text-4xl font-semibold text-white sm:text-5xl">{card.label}</p>
              <p className="mt-2 font-mono text-base text-zinc-400">{card.expression}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {OPERATORS.map(({ op, symbol }) => (
            <Button
              key={op}
              variant={operator === op ? 'solid' : 'outline'}
              size="lg"
              className="min-w-[4rem] text-2xl"
              onClick={() => {
                if (!selectedCard) {
                  setMessage('Select a card first.');
                  return;
                }
                setOperator(op);
                setMessage('Select another card to apply the operator.');
              }}
            >
              {symbol}
            </Button>
          ))}
        </div>

        <p className="text-center text-base text-zinc-400 sm:text-lg">{message}</p>
        {solved && (
          <p className="text-center text-base font-medium text-emerald-400 sm:text-lg">
            Solved in {history.length + 1} steps. {cards[0]?.expression}
          </p>
        )}
      </Card>

      <Card className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xl font-medium text-white">Hints</p>
          <Button
            variant="outline"
            size="md"
            onClick={() => setVisibleHints((prev) => Math.min(prev + 1, hints.length))}
            disabled={visibleHints >= hints.length}
          >
            Reveal hint
          </Button>
        </div>
        {visibleHints === 0 && <p className="text-center text-base text-zinc-400 sm:text-lg">No hints shown.</p>}
        <ul className="space-y-3 text-base text-zinc-300 sm:text-lg">
          {hints.slice(0, visibleHints).map((hint, index) => (
            <li key={index} className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {hint.description}
              {hint.expression && (
                <span className="font-mono text-sm text-zinc-500">{hint.expression}</span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
