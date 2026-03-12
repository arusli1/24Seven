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
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--accent))] active:scale-[0.98]',
        {
          solid:
            'bg-[rgb(var(--accent))] text-black hover:bg-[rgb(var(--accent-hover))] disabled:opacity-50',
          outline:
            'border border-white/20 bg-transparent text-white hover:border-white/30 hover:bg-white/[0.04] disabled:opacity-50',
          ghost: 'text-zinc-400 hover:bg-white/[0.04] hover:text-white disabled:opacity-50',
        }[variant],
        {
          sm: 'px-4 py-2 text-base',
          md: 'px-5 py-2.5 text-base',
          lg: 'px-6 py-3 text-lg',
        }[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
