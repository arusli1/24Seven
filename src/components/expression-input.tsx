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
    <div className="flex flex-col gap-3">
      <label htmlFor="expression" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Your expression
      </label>
      <input
        id="expression"
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-lg font-mono shadow-inner focus:border-accent"
        placeholder="(8 / (3 - 2)) * 6"
        value={value}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onCheck();
          }
        }}
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={onCheck}>Check</Button>
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
