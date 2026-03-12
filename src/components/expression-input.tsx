'use client';

import { ChangeEvent } from 'react';
import { Button } from './ui/button';

interface ExpressionInputProps {
  value: string;
  onChange: (value: string) => void;
  onCheck: () => void;
  onClear: () => void;
  onBackspace: () => void;
}

export function ExpressionInput({ value, onChange, onCheck, onClear, onBackspace }: ExpressionInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <label htmlFor="expression" className="w-full text-center text-base font-medium text-zinc-400 sm:text-lg">
        Your expression
      </label>
      <input
        id="expression"
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 font-mono text-xl text-white placeholder:text-zinc-500 focus:border-[rgb(var(--accent))]/50 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent))]/30"
        placeholder="(8 ÷ (3 − 2)) × 6"
        value={value}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onCheck();
          }
        }}
      />
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onCheck} size="lg">
          Check
        </Button>
        <Button variant="outline" onClick={onClear}>
          Clear
        </Button>
        <Button variant="ghost" onClick={onBackspace}>
          Backspace
        </Button>
      </div>
    </div>
  );
}
