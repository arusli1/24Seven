'use client';

interface KeypadProps {
  onInsert: (value: string) => void;
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '+', '-', '*', '/', '(', ')'];

export function Keypad({ onInsert }: KeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className="rounded-2xl bg-slate-100 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-200"
          onClick={() => onInsert(key)}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
