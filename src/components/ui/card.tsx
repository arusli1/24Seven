import { ReactNode } from 'react';
import clsx from 'clsx';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--surface))] p-5 shadow-panel sm:p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
