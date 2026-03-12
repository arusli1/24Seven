import Link from 'next/link';
import { ReactNode } from 'react';

interface ModeCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

export function ModeCard({ title, description, href, icon }: ModeCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-3xl bg-white/90 p-6 shadow-card transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-2xl text-accent">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <span className="mt-4 text-sm font-semibold text-accent">Open →</span>
    </Link>
  );
}
