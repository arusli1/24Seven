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
    <div className="grid grid-cols-2 gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-5">
      {rows.map((row) => (
        <div key={row.label}>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">{row.label}</p>
          <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{row.value}</p>
        </div>
      ))}
    </div>
  );
}
