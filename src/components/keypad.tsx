'use client';

interface KeypadProps {
  onInsert: (value: string) => void;
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '+', '-', '*', '/', '(', ')'];

export function Keypad({ onInsert }: KeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className="min-h-[48px] rounded-xl bg-[rgb(var(--bg-base))] font-mono text-lg font-semibold text-[rgb(var(--ink))] shadow-inner-soft transition-all duration-150 hover:bg-[rgb(var(--border))]/50 active:scale-[0.97] sm:min-h-[52px] sm:text-xl"
          onClick={() => onInsert(key)}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
