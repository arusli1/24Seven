import { DifficultyTier } from '@/lib/types';
import clsx from 'clsx';

interface PuzzleCardsProps {
  numbers: number[];
  tier?: DifficultyTier;
  showTier?: boolean;
}

const tierColors: Record<DifficultyTier, string> = {
  Easy: 'from-emerald-100 to-emerald-50 text-emerald-700',
  Medium: 'from-amber-100 to-amber-50 text-amber-700',
  Hard: 'from-rose-100 to-rose-50 text-rose-700',
  Expert: 'from-indigo-100 to-indigo-50 text-indigo-700'
};

export function PuzzleCards({ numbers, tier, showTier }: PuzzleCardsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {numbers.map((num, index) => (
        <div
          key={`${num}-${index}`}
          className="flex h-24 w-20 flex-col items-center justify-center rounded-3xl bg-white text-3xl font-bold text-slate-900 shadow-card"
          aria-label={`Card ${index + 1} with value ${num}`}
        >
          {num}
        </div>
      ))}
      {showTier && tier && (
        <span className={clsx('rounded-full px-4 py-2 text-sm font-semibold', 'bg-gradient-to-r', tierColors[tier])}>{tier} tier</span>
      )}
    </div>
  );
}
