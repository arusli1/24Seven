'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puzzle, DifficultyTier } from '@/lib/types';
import { validateExpression } from '@/lib/validate';
import { getHints } from '@/lib/solver';
import { PuzzleCards } from '@/components/puzzle-cards';
import { ExpressionInput } from '@/components/expression-input';
import { Button } from '@/components/ui/button';
import { Keypad } from '@/components/keypad';
import { HintPanel } from '@/components/hint-panel';
import { Toggle } from '@/components/ui/toggle';

interface Props {
  puzzles: Puzzle[];
}

const tiers: (DifficultyTier | 'All')[] = ['All', 'Easy', 'Medium', 'Hard', 'Expert'];

export function PlayClient({ puzzles }: Props) {
  const [tierFilter, setTierFilter] = useState<(typeof tiers)[number]>('All');
  const [showTier, setShowTier] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [expression, setExpression] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [visibleHints, setVisibleHints] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const filtered = useMemo(() => (tierFilter === 'All' ? puzzles : puzzles.filter((puzzle) => puzzle.tier === tierFilter)), [puzzles, tierFilter]);
  const hasPuzzles = filtered.length > 0;
  const safeIndex = hasPuzzles ? puzzleIndex % filtered.length : 0;
  const current = hasPuzzles ? filtered[safeIndex] : null;
  const hints = useMemo(
    () => (current ? getHints(current.numbers).map((hint) => ({ description: hint.description, expression: hint.expression })) : []),
    [current]
  );

  useEffect(() => {
    if (!current) return;
    setElapsedMs(0);
    const startedAt = Date.now();
    let raf: number | null = null;
    if (timerEnabled) {
      const tick = () => {
        setElapsedMs(Date.now() - startedAt);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [current, timerEnabled]);

  useEffect(() => {
    if (!current) return;
    setExpression('');
    setStatus({ type: 'idle', message: '' });
    setVisibleHints(0);
  }, [current]);

  const handleCheck = () => {
    if (!current) return;
    const result = validateExpression(expression, current.numbers);
    if (result.ok) {
      setStatus({ type: 'success', message: 'Nice! That hits 24 exactly.' });
    } else {
      setStatus({ type: 'error', message: result.reason });
    }
  };

  const nextPuzzle = () => {
    if (!hasPuzzles) return;
    setPuzzleIndex(Math.floor(Math.random() * filtered.length));
  };

  const handleInsert = (value: string) => {
    setExpression((prev) => `${prev}${value}`);
  };

  if (!current) {
    return <p className="text-center text-sm text-red-500">No puzzles available for this tier. Run the importer.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        {tiers.map((tier) => (
          <button
            key={tier}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tierFilter === tier ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600'}`}
            onClick={() => setTierFilter(tier)}
          >
            {tier}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <Toggle label="Show difficulty tag" checked={showTier} onChange={setShowTier} />
        <Toggle label="Timer" checked={timerEnabled} onChange={setTimerEnabled} />
        {timerEnabled && <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-mono text-white">{(elapsedMs / 1000).toFixed(1)}s</span>}
      </div>
      <PuzzleCards numbers={current.numbers} tier={current.tier} showTier={showTier} />
      <div className="flex flex-wrap gap-4">
        <Button variant="secondary" onClick={() => setVisibleHints((prev) => Math.min(prev + 1, hints.length))}>
          Give hint
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (window.confirm('Reveal the full solution?')) {
              setVisibleHints(hints.length);
            }
          }}
        >
          Show solution
        </Button>
        <Button onClick={nextPuzzle}>
          New puzzle
        </Button>
      </div>
      <ExpressionInput
        value={expression}
        onChange={setExpression}
        onBackspace={() => setExpression((prev) => prev.slice(0, -1))}
        onClear={() => setExpression('')}
        onCheck={handleCheck}
      />
      <p className={status.type === 'success' ? 'text-emerald-600' : status.type === 'error' ? 'text-rose-600' : 'text-slate-500'}>
        {status.message || 'waiting for your attempt…'}
      </p>
      <HintPanel hints={hints} visibleHints={visibleHints} onReveal={() => setVisibleHints((prev) => Math.min(prev + 1, hints.length))} />
      <div className="rounded-3xl bg-white/80 p-4 shadow-card">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Quick keypad</p>
        <Keypad onInsert={handleInsert} />
      </div>
    </div>
  );
}
