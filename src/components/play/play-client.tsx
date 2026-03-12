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
    return <p className="text-sm text-rose-600">No puzzles. Run <code>npm run import:difficulties</code></p>;
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setPuzzleIndex((prev) => prev + 1)}>
            New puzzle
          </Button>
          <Button variant="ghost" size="sm" onClick={undoLast} disabled={history.length === 0}>
            Undo
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 px-4 py-5 text-center transition-all duration-200 active:scale-[0.98] ${
                selectedCard === card.id
                  ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent-soft))] shadow-panel'
                  : solved && cards[0].id === card.id
                    ? 'border-emerald-400 bg-emerald-50 shadow-panel'
                    : 'border-[rgb(var(--border))] bg-[rgb(var(--surface))] hover:border-[rgb(var(--accent))]/40 hover:shadow-panel'
              }`}
            >
              <p className="font-display text-2xl font-bold text-[rgb(var(--ink))] sm:text-3xl">{card.label}</p>
              <p className="mt-1 font-mono text-xs text-[rgb(var(--ink-muted))]">{card.expression}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(['+', '-', '*', '/'] as Operator[]).map((op) => (
            <Button
              key={op}
              variant={operator === op ? 'solid' : 'outline'}
              size="sm"
              onClick={() => {
                if (!selectedCard) {
                  setMessage('Select a card first.');
                  return;
                }
                setOperator(op);
                setMessage('Select another card to apply the operator.');
              }}
            >
              {op}
            </Button>
          ))}
        </div>

        <p className="text-sm text-[rgb(var(--ink-muted))]">{message}</p>
        {solved && (
          <p className="text-sm font-semibold text-emerald-600">
            Solved in {history.length + 1} steps. {cards[0]?.expression}
          </p>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-[rgb(var(--ink))]">Hints</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleHints((prev) => Math.min(prev + 1, hints.length))}
            disabled={visibleHints >= hints.length}
          >
            Reveal hint
          </Button>
        </div>
        {visibleHints === 0 && <p className="text-sm text-[rgb(var(--ink-muted))]">No hints shown.</p>}
        <ul className="space-y-2 text-sm text-[rgb(var(--ink))]">
          {hints.slice(0, visibleHints).map((hint, index) => (
            <li key={index} className="flex flex-wrap items-center gap-2">
              {hint.description}
              {hint.expression && (
                <span className="font-mono text-xs text-[rgb(var(--ink-muted))]">{hint.expression}</span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
