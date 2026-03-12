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
      <label htmlFor="expression" className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--ink-muted))]">
        Your expression
      </label>
      <input
        id="expression"
        className="rounded-xl border-2 border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3 font-mono text-lg shadow-inner-soft transition-colors placeholder:text-[rgb(var(--ink-subtle))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20"
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
      <div className="flex flex-wrap gap-2">
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
