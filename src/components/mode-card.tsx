import Link from 'next/link';

interface ModeCardProps {
  number: string;
  title: string;
  description: string;
  href: string;
}

export function ModeCard({ number, title, description, href }: ModeCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-6 border-b border-white/[0.06] py-16 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-start sm:gap-12 sm:px-8 sm:py-10 sm:-mx-8 sm:rounded-2xl lg:gap-16 lg:py-12 lg:px-10"
    >
      <span className="text-xl font-medium tabular-nums text-zinc-500 sm:text-2xl lg:text-3xl">{number}</span>
      <div className="flex flex-1 flex-col gap-4">
        <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h3>
        <p className="max-w-2xl text-xl text-zinc-400 sm:text-2xl lg:text-3xl">{description}</p>
      </div>
      <span className="inline-flex items-center gap-2 text-lg font-medium text-[rgb(var(--accent))] opacity-0 transition-all group-hover:opacity-100 sm:opacity-70 sm:text-xl">
        Open <span>→</span>
      </span>
    </Link>
  );
}
