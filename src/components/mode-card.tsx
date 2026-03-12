import Link from 'next/link';

interface ModeCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  accent?: 'amber' | 'coral' | 'teal';
}

const accentStyles = {
  amber: 'from-amber-500/20 to-amber-600/10 text-amber-600 group-hover:from-amber-500/30',
  coral: 'from-rose-500/20 to-orange-500/10 text-rose-600 group-hover:from-rose-500/30',
  teal: 'from-teal-500/20 to-cyan-500/10 text-teal-600 group-hover:from-teal-500/30',
};

export function ModeCard({ title, description, href, icon, accent = 'amber' }: ModeCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--surface))] p-6 shadow-panel transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--accent))]/20 hover:shadow-panel-lg sm:p-8"
    >
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl transition-smooth ${accentStyles[accent]}`}
      >
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold text-[rgb(var(--ink))]">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[rgb(var(--ink-muted))]">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--accent))] transition-smooth group-hover:gap-3">
        Open <span className="text-base">→</span>
      </span>
    </Link>
  );
}
