export default function AboutPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-10 sm:px-10 sm:py-14 lg:max-w-4xl lg:px-16 lg:py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          How to play
        </h1>
        <p className="mt-6 text-xl text-zinc-400 sm:text-2xl">
          You get four numbers. Use <span className="text-white">+ − × ÷</span> and parentheses to make exactly 24. Use each number once.
        </p>
        <ul className="mx-auto mt-6 max-w-md space-y-3 text-left text-xl text-zinc-400 sm:text-2xl">
          <li>• Fractions are allowed (e.g. 1/3)</li>
          <li>• No negative numbers in your expression</li>
          <li>• Press Enter to submit</li>
        </ul>
      </div>
    </main>
  );
}
