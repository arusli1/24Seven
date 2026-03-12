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
  if (puzzles.length === 0) {
    return <p className="text-sm text-red-500">No puzzles available. Import difficulties first.</p>;
  }
  const [timeLimit, setTimeLimit] = useState(60);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 1000);
  const [expression, setExpression] = useState('');
  const [currentPuzzle, setCurrentPuzzle] = useState(() => puzzles[0]);
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
    const random = puzzles[Math.floor(Math.random() * puzzles.length)];
    setCurrentPuzzle(random);
  }, [puzzles]);

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

  const summary: SpeedrunSummary = useMemo(() => ({
    puzzlesSolved,
    totalAttempts,
    invalidAttempts,
    averageSolveMs,
    timeLimit
  }), [puzzlesSolved, totalAttempts, invalidAttempts, averageSolveMs, timeLimit]);

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
          averageSolveMs: averageSolveMs || 0
        })
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {LIMITS.map((limit) => (
          <button
            key={limit}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${timeLimit === limit ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600'}`}
            onClick={() => setTimeLimit(limit)}
            disabled={running}
          >
            {limit}s
          </button>
        ))}
        <Button onClick={startRun}>{running ? 'Restart' : 'Start speedrun'}</Button>
        <span className="rounded-full bg-slate-900 px-4 py-1 text-sm font-mono text-white">{(timeLeft / 1000).toFixed(1)}s left</span>
      </div>
      <PuzzleCards numbers={currentPuzzle.numbers} tier={currentPuzzle.tier} showTier />
      <ExpressionInput
        value={expression}
        onChange={setExpression}
        onBackspace={() => setExpression((prev) => prev.slice(0, -1))}
        onClear={() => setExpression('')}
        onCheck={handleCheck}
      />
      <p className="text-sm text-slate-500">{status || 'Type your expression and press Enter.'}</p>
      <Keypad onInsert={(value) => setExpression((prev) => `${prev}${value}`)} />
      {!running && puzzlesSolved > 0 && (
        <div className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-card">
          <h3 className="text-lg font-semibold text-slate-900">Run summary</h3>
          <SpeedrunStats summary={summary} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Submit to leaderboard</label>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2"
              placeholder="Nickname"
            />
            <Button onClick={submitScore} disabled={saving}>
              {saving ? 'Saving…' : 'Submit score'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
