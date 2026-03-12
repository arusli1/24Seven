'use client';

import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'solid', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--accent))] active:scale-[0.98]',
        {
          solid:
            'bg-[rgb(var(--accent))] text-white shadow-panel hover:bg-[rgb(var(--accent-hover))] hover:shadow-panel-lg disabled:bg-[rgb(var(--ink-subtle))] disabled:shadow-none',
          outline:
            'border-2 border-[rgb(var(--border))] bg-transparent text-[rgb(var(--ink))] hover:border-[rgb(var(--accent))]/50 hover:bg-[rgb(var(--accent-soft))]/50 disabled:opacity-50',
          ghost: 'text-[rgb(var(--ink-muted))] hover:bg-[rgb(var(--accent-soft))]/30 hover:text-[rgb(var(--ink))] disabled:opacity-50',
        }[variant],
        {
          sm: 'px-3 py-1.5 text-sm',
          md: 'px-5 py-2.5 text-sm',
          lg: 'px-6 py-3 text-base',
        }[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
