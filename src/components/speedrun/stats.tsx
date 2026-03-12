import { SpeedrunSummary } from '@/lib/types';

interface StatsProps {
  summary: SpeedrunSummary;
}

export function SpeedrunStats({ summary }: StatsProps) {
  const rows = [
    { label: 'Solved', value: summary.puzzlesSolved },
    { label: 'Attempts', value: summary.totalAttempts },
    { label: 'Invalid', value: summary.invalidAttempts },
    { label: 'Avg time (s)', value: (summary.averageSolveMs / 1000).toFixed(2) },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[rgb(var(--accent))]/20 bg-[rgb(var(--accent-soft))]/50 p-5">
      {rows.map((row) => (
        <div key={row.label}>
          <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--ink-muted))]">{row.label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-[rgb(var(--ink))]">{row.value}</p>
        </div>
      ))}
    </div>
  );
}
