'use client';

interface KeypadProps {
  onInsert: (value: string) => void;
}

const KEYS: { display: string; insert: string }[] = [
  { display: '7', insert: '7' },
  { display: '8', insert: '8' },
  { display: '9', insert: '9' },
  { display: '4', insert: '4' },
  { display: '5', insert: '5' },
  { display: '6', insert: '6' },
  { display: '1', insert: '1' },
  { display: '2', insert: '2' },
  { display: '3', insert: '3' },
  { display: '0', insert: '0' },
  { display: '+', insert: '+' },
  { display: '−', insert: '-' },
  { display: '×', insert: '*' },
  { display: '÷', insert: '/' },
  { display: '(', insert: '(' },
  { display: ')', insert: ')' },
];

export function Keypad({ onInsert }: KeypadProps) {
  return (
    <div className="grid max-w-md grid-cols-4 gap-3 sm:gap-4">
      {KEYS.map(({ display, insert }) => (
        <button
          key={insert + display}
          type="button"
          className="min-h-[56px] rounded-xl border border-white/[0.06] bg-white/[0.04] font-mono text-xl font-medium text-white transition-colors hover:bg-white/[0.08] active:scale-[0.98] sm:min-h-[64px] sm:text-2xl"
          onClick={() => onInsert(insert)}
        >
          {display}
        </button>
      ))}
    </div>
  );
}
