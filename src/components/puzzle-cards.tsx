interface PuzzleCardsProps {
  numbers: number[];
}

export function PuzzleCards({ numbers }: PuzzleCardsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {numbers.map((num, index) => (
        <div
          key={`${num}-${index}`}
          className="flex h-20 w-16 flex-col items-center justify-center rounded-2xl border-2 border-[rgb(var(--border))]/60 bg-[rgb(var(--surface))] font-display text-3xl font-bold text-[rgb(var(--ink))] shadow-panel sm:h-24 sm:w-20 sm:text-4xl"
          aria-label={`Card ${index + 1} with value ${num}`}
        >
          {num}
        </div>
      ))}
    </div>
  );
}
