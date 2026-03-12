import { SpeedrunSummary } from '@/lib/types';

interface StatsProps {
  summary: SpeedrunSummary;
}

export function SpeedrunStats({ summary }: StatsProps) {
  const rows = [
    { label: 'Solved', value: summary.puzzlesSolved },
    { label: 'Attempts', value: summary.totalAttempts },
    { label: 'Invalid', value: summary.invalidAttempts },
    { label: 'Avg time (s)', value: (summary.averageSolveMs / 1000).toFixed(2) }
  ];
  return (
    <div className="grid grid-cols-2 gap-4 rounded-3xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
      {rows.map((row) => (
        <div key={row.label}>
          <p className="text-xs uppercase tracking-wide text-slate-500">{row.label}</p>
          <p className="text-xl font-bold text-slate-900">{row.value}</p>
        </div>
      ))}
    </div>
  );
}
