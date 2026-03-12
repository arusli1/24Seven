interface PuzzleCardsProps {
  numbers: number[];
}

export function PuzzleCards({ numbers }: PuzzleCardsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {numbers.map((num, index) => (
        <div
          key={`${num}-${index}`}
          className="flex h-28 w-24 items-center justify-center rounded-2xl border-2 border-white/[0.08] bg-white/[0.04] text-4xl font-semibold text-white shadow-lg sm:h-36 sm:w-28 sm:text-5xl"
          aria-label={`Card ${index + 1} with value ${num}`}
        >
          {num}
        </div>
      ))}
    </div>
  );
}
