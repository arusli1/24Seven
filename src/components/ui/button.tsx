'use client';

import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-2xl font-semibold transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        {
          primary: 'bg-accent text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600',
          secondary: 'bg-white text-accent border border-blue-100 hover:border-blue-300',
          ghost: 'bg-transparent text-slate-600 hover:text-slate-900'
        }[variant],
        {
          md: 'px-4 py-2 text-base',
          lg: 'px-6 py-3 text-lg'
        }[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
