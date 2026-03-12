'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puzzle, DifficultyTier } from '@/lib/types';
import { getHints, solvePuzzle } from '@/lib/solver';
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

const tiers: (DifficultyTier | 'All')[] = ['All', 'Easy', 'Medium', 'Hard', 'Expert'];
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
  const [tierFilter, setTierFilter] = useState<(typeof tiers)[number]>('All');
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [cards, setCards] = useState<CardState[]>([]);
  const [history, setHistory] = useState<CardState[][]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [message, setMessage] = useState('Select a card to start.');
  const [visibleHints, setVisibleHints] = useState(0);

  const filtered = useMemo(() => (tierFilter === 'All' ? puzzles : puzzles.filter((puzzle) => puzzle.tier === tierFilter)), [puzzles, tierFilter]);
  const hasPuzzles = filtered.length > 0;
  const currentPuzzle = hasPuzzles ? filtered[puzzleIndex % filtered.length] : null;

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
    return <p className="text-sm text-red-600">No puzzles available. Run the importer.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tiers.map((tier) => (
          <Button key={tier} variant={tierFilter === tier ? 'solid' : 'outline'} size="sm" onClick={() => setTierFilter(tier)}>
            {tier}
          </Button>
        ))}
      </div>

      <Card className="space-y-4 border border-outline shadow-panel">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">{currentPuzzle.tier} • {currentPuzzle.difficulty}</p>
            {cards.length === 1 && <p className="text-sm text-ink">{cards[0].expression}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPuzzleIndex((prev) => prev + 1)}>New puzzle</Button>
            <Button variant="ghost" size="sm" onClick={undoLast} disabled={history.length === 0}>Undo</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`rounded-md border px-3 py-3 text-left text-ink ${selectedCard === card.id ? 'border-ink' : 'border-outline'} ${solved && cards[0].id === card.id ? 'bg-accentMuted' : 'bg-surface'}`}
            >
              <p className="text-lg font-semibold">{card.label}</p>
              <p className="text-xs text-muted">{card.expression}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['+', '-', '*', '/'] as Operator[]).map((op) => (
            <Button key={op} variant={operator === op ? 'solid' : 'outline'} size="sm" onClick={() => {
              if (!selectedCard) {
                setMessage('Select a card first.');
                return;
              }
              setOperator(op);
              setMessage('Select another card to apply the operator.');
            }}>
              {op}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted">{message}</p>
        {solved && <p className="text-sm font-medium text-ink">Solved in {history.length + 1} steps.</p>}
      </Card>

      <Card className="space-y-3 border border-outline shadow-panel">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Hints</p>
          <Button variant="outline" size="sm" onClick={() => setVisibleHints((prev) => Math.min(prev + 1, hints.length))} disabled={visibleHints >= hints.length}>
            Reveal hint
          </Button>
        </div>
        {visibleHints === 0 && <p className="text-sm text-muted">No hints shown.</p>}
        <ul className="space-y-2 text-sm text-ink">
          {hints.slice(0, visibleHints).map((hint, index) => (
            <li key={index}>
              {hint.description}
              {hint.expression && <span className="ml-2 font-mono text-xs text-muted">{hint.expression}</span>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
