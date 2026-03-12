import { Game } from '@/components/game';
import { loadPuzzles } from '@/lib/difficulty';

export default function HomePage() {
  const puzzles = loadPuzzles();
  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4 sm:p-8 md:p-10"
      style={{
        background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #1a1625 0%, #0d0b12 50%, #050408 100%)',
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 w-full max-w-4xl px-2">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <div className="border-b border-white/[0.06] px-6 py-8 sm:px-12 sm:py-10 md:px-16 md:py-12">
            <div className="flex flex-col items-center text-center">
              <span className="mb-3 text-4xl opacity-90 sm:text-5xl">◆</span>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                24
              </h1>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-zinc-400 sm:text-lg">
                Combine the numbers with + − × ÷ to make 24.
              </p>
            </div>
          </div>
          <div className="px-6 py-8 sm:px-12 sm:py-10 md:px-16 md:py-12">
            <Game puzzles={puzzles} />
          </div>
        </div>
      </div>
    </main>
  );
}
