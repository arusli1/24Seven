import { ReactNode } from 'react';
import clsx from 'clsx';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('rounded-3xl bg-white/90 p-6 shadow-card backdrop-blur', className)}>{children}</div>;
}
