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
    return <p className="text-sm text-rose-400">No puzzles available. Import difficulties first.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-8">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {LIMITS.map((limit) => (
          <button
            key={limit}
            className={`rounded-lg px-5 py-3 text-base font-medium transition-all sm:text-lg ${
              timeLimit === limit
                ? 'bg-[rgb(var(--accent))] text-black'
                : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
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
        <span className="rounded-lg bg-white/[0.08] px-5 py-2.5 font-mono text-base font-medium text-white sm:text-lg">
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

      <p className="text-center text-base text-zinc-400 sm:text-lg">{status || 'Type your expression and press Enter.'}</p>

      <div className="flex justify-center">
        <Keypad onInsert={(value) => setExpression((prev) => `${prev}${value}`)} />
      </div>

      {!running && puzzlesSolved > 0 && (
        <div className="w-full max-w-2xl space-y-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10">
          <h3 className="text-xl font-semibold text-white sm:text-2xl">Run summary</h3>
          <SpeedrunStats summary={summary} />
          <div className="space-y-3">
            <label className="text-base font-medium text-white sm:text-lg">Submit to leaderboard</label>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-[rgb(var(--accent))]/50 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent))]/30"
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
