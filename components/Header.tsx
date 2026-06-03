export function Header() {
  const now = new Date();
  const timestamp = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(now);

  return (
    <header className="bg-white text-black">
      <div className="mx-auto max-w-[1500px] px-3 pt-3">
        <div className="border-b-2 border-black pb-2 text-center font-mono text-xs font-black uppercase tracking-[0.2em] text-red-700 md:text-sm">
          {timestamp}
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
          <div className="flex min-h-32 flex-col items-center justify-center px-2 text-center">
            <a href="#top" className="inline-block border-y-4 border-black px-2 py-1 font-sans text-6xl font-black uppercase leading-[0.86] tracking-[-0.075em] text-black shadow-[0_6px_0_0_rgba(185,28,28,0.18)] sm:text-7xl lg:text-9xl">
              SHUT<span className="text-red-700">YOUR</span>FACE<span className="ml-2 align-baseline text-2xl font-black tracking-[-0.03em] text-red-700 sm:text-3xl lg:text-5xl">.com</span>
            </a>
            <p className="mt-3 border-t border-zinc-300 pt-1 font-sans text-lg font-extrabold uppercase tracking-[0.08em] md:text-2xl">
              <span className="text-red-700">★</span> Real news. No BS. Say less. <span className="text-red-700">★</span>
            </p>
          </div>
          <div className="hidden border-2 border-black p-3 md:block">
            <p className="font-tabloid text-xl uppercase">Get the news first</p>
            <form className="mt-2 flex gap-2">
              <input aria-label="Header email address" type="email" placeholder="Enter your email" className="min-w-0 flex-1 border border-black px-2 py-2 text-sm text-black" />
              <button type="submit" className="bg-red-700 px-3 py-2 font-tabloid text-lg uppercase text-white hover:bg-black">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
