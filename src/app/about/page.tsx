export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">About the 24 Game</h1>
      <p className="mt-4 text-slate-600">
        Draw four numbers (Aces count as 1, face cards as 11-13). Combine them with +, -, *, /, and parentheses to make exactly 24. Use each
        card once. Fractions are fine, but negative literals are not.
      </p>
      <section className="mt-8 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Validation rules</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            <li>Only integers and the operators + - * / with parentheses are accepted.</li>
            <li>You must use each of the four cards exactly once (duplicates allowed only if the puzzle includes them).</li>
            <li>Division by zero immediately fails. We evaluate using rational arithmetic so 1/3 is exact.</li>
            <li>Whitespace is ignored; Enter submits the expression.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Difficulty data</h2>
          <p className="text-slate-600">
            Puzzles and difficulty scores come from the community-maintained dataset at 4nums.com. Run <code>npm run import:difficulties</code>
            to refresh <code>data/difficulties.json</code>; the importer falls back to <code>data/difficulties.sample.json</code> when offline.
          </p>
        </div>
      </section>
    </main>
  );
}
