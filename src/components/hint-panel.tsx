'use client';

import { SolutionHint } from '@/lib/types';
import { Button } from './ui/button';

interface HintPanelProps {
  hints: SolutionHint[];
  visibleHints: number;
  onReveal: () => void;
}

export function HintPanel({ hints, visibleHints, onReveal }: HintPanelProps) {
  const display = hints.slice(0, visibleHints);
  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">Hints</h4>
        <Button variant="secondary" size="md" onClick={onReveal} disabled={visibleHints >= hints.length}>
          Reveal next
        </Button>
      </div>
      {display.length === 0 && <p className="text-sm text-slate-500">No hints shown yet.</p>}
      <ul className="space-y-2 text-sm text-slate-600">
        {display.map((hint, index) => (
          <li key={index}>
            <span className="font-semibold text-slate-700">{hint.description}</span>
            {hint.expression && <span className="ml-2 font-mono text-slate-800">{hint.expression}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
