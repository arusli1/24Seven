'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puzzle, SpeedrunSummary } from '@/lib/types';
import { PuzzleCards } from '@/components/puzzle-cards';
import { ExpressionInput } from '@/components/expression-input';
import { Keypad } from '@/components/keypad';
import { Button } from '@/components/ui/button';
import { validateExpression } from '@/lib/validate';
import { SpeedrunStats } from './stats';

const LIMITS = [60, 120, 300];

interface Props {
  puzzles: Puzzle[];
}

export function SpeedrunClient({ puzzles }: Props) {
  const hasPuzzles = puzzles.length > 0;
  const [timeLimit, setTimeLimit] = useState(60);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 1000);
  const [expression, setExpression] = useState('');
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(() => (hasPuzzles ? puzzles[0] : null));
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [invalidAttempts, setInvalidAttempts] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [solveDurations, setSolveDurations] = useState<number[]>([]);
  const [lastSolvedAt, setLastSolvedAt] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTimeLeft(timeLimit * 1000);
  }, [timeLimit]);

  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now();
    let raf: number;
    const tick = () => {
      const remaining = timeLimit * 1000 - (Date.now() - startedAt);
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        setRunning(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, timeLimit]);

  useEffect(() => {
    if (!hasPuzzles) {
      setCurrentPuzzle(null);
      return;
    }
    const random = puzzles[Math.floor(Math.random() * puzzles.length)];
    setCurrentPuzzle(random);
  }, [puzzles, hasPuzzles]);

  const startRun = () => {
    setRunning(true);
    setTimeLeft(timeLimit * 1000);
    setTotalAttempts(0);
    setInvalidAttempts(0);
    setPuzzlesSolved(0);
    setSolveDurations([]);
    setExpression('');
    setStatus('');
    setLastSolvedAt(Date.now());
  };

  const nextPuzzle = () => {
    if (!hasPuzzles) {
      setCurrentPuzzle(null);
      return;
    }
    const random = puzzles[Math.floor(Math.random() * puzzles.length)];
    setCurrentPuzzle(random);
    setExpression('');
  };

  const handleCheck = () => {
    if (!running) {
      setStatus('Start the timer first.');
      return;
    }
    setTotalAttempts((prev) => prev + 1);
    if (!currentPuzzle) {
      setStatus('No puzzles available. Import difficulties first.');
      return;
    }
    const result = validateExpression(expression, currentPuzzle.numbers);
    if (result.ok) {
      setPuzzlesSolved((prev) => prev + 1);
      if (lastSolvedAt) {
        setSolveDurations((prev) => [...prev, Date.now() - lastSolvedAt]);
      }
      setLastSolvedAt(Date.now());
      setStatus('Correct! Next puzzle…');
      nextPuzzle();
    } else {
      setInvalidAttempts((prev) => prev + 1);
      setStatus(result.reason);
    }
  };

  const averageSolveMs = solveDurations.length
    ? Math.round(solveDurations.reduce((sum, value) => sum + value, 0) / solveDurations.length)
    : 0;

  const summary: SpeedrunSummary = useMemo(
    () => ({
      puzzlesSolved,
      totalAttempts,
      invalidAttempts,
      averageSolveMs,
      timeLimit,
    }),
    [puzzlesSolved, totalAttempts, invalidAttempts, averageSolveMs, timeLimit]
  );

  const submitScore = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'speedrun',
          nickname: nickname || 'Anonymous',
          timeLimit,
          puzzlesSolved,
          totalAttempts,
          invalidAttempts,
          averageSolveMs: averageSolveMs || 0,
        }),
      });
      if (!response.ok) {
        const body = await response.json();
        setStatus(body.error ?? 'Unable to save score.');
      } else {
        setStatus('Saved to leaderboard ✓');
      }
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!currentPuzzle) {
    return <p className="text-sm text-rose-600">No puzzles available. Import difficulties first.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {LIMITS.map((limit) => (
          <button
            key={limit}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              timeLimit === limit
                ? 'bg-[rgb(var(--accent))] text-white shadow-panel'
                : 'bg-[rgb(var(--bg-base))] text-[rgb(var(--ink-muted))] hover:bg-[rgb(var(--border))]/50'
            }`}
            onClick={() => setTimeLimit(limit)}
            disabled={running}
          >
            {limit}s
          </button>
        ))}
        <Button onClick={startRun} size="lg">
          {running ? 'Restart' : 'Start speedrun'}
        </Button>
        <span className="rounded-xl bg-[rgb(var(--ink))] px-4 py-2 font-mono text-sm font-semibold text-white">
          {(timeLeft / 1000).toFixed(1)}s left
        </span>
      </div>

      <PuzzleCards numbers={currentPuzzle.numbers} />

      <ExpressionInput
        value={expression}
        onChange={setExpression}
        onBackspace={() => setExpression((prev) => prev.slice(0, -1))}
        onClear={() => setExpression('')}
        onCheck={handleCheck}
      />

      <p className="text-sm text-[rgb(var(--ink-muted))]">{status || 'Type your expression and press Enter.'}</p>

      <Keypad onInsert={(value) => setExpression((prev) => `${prev}${value}`)} />

      {!running && puzzlesSolved > 0 && (
        <div className="space-y-5 rounded-3xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--surface))] p-6 shadow-panel sm:p-8">
          <h3 className="font-display text-xl font-semibold text-[rgb(var(--ink))]">Run summary</h3>
          <SpeedrunStats summary={summary} />
          <div className="space-y-3">
            <label className="text-sm font-medium text-[rgb(var(--ink))]">Submit to leaderboard</label>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="w-full rounded-xl border-2 border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-2.5 transition-colors placeholder:text-[rgb(var(--ink-subtle))] focus:border-[rgb(var(--accent))] focus:outline-none"
              placeholder="Nickname"
            />
            <Button onClick={submitScore} disabled={saving} size="lg">
              {saving ? 'Saving…' : 'Submit score'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
