export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--ink))]">
        How to play
      </h1>
      <p className="mt-4 text-[rgb(var(--ink-muted))]">
        You get four numbers. Use +, −, ×, ÷ and parentheses to make exactly 24. Use each number once.
      </p>
      <ul className="mt-4 space-y-2 text-[rgb(var(--ink-muted))]">
        <li>• Fractions are allowed (e.g. 1/3)</li>
        <li>• No negative numbers in your expression</li>
        <li>• Press Enter to submit</li>
      </ul>
    </main>
  );
}
