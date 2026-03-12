'use client';

import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'solid', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        {
          solid: 'bg-accent text-white hover:bg-indigo-600 disabled:bg-indigo-300',
          outline: 'border border-outline text-ink hover:border-ink disabled:text-muted',
          ghost: 'text-muted hover:text-ink'
        }[variant],
        size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
