import { ReactNode } from 'react';
import clsx from 'clsx';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8',
        className
      )}
    >
      {children}
    </div>
  );
}
