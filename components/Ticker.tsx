type TickerProps = {
  items: string[];
};

export function Ticker({ items }: TickerProps) {
  const doubled = [...items, ...items];

  return (
    <div className="mx-auto max-w-[1500px] px-3">
      <div className="flex border-b border-zinc-300 bg-white text-black">
        <div className="bg-red-700 px-3 py-2 font-tabloid text-lg uppercase text-white">Breaking:</div>
        <div className="flex-1 overflow-hidden py-2">
          <div className="ticker-track flex w-max gap-8 whitespace-nowrap text-sm font-black">
            {doubled.map((item, index) => (
              <span key={`${item}-${index}`}>{item}...</span>
            ))}
          </div>
        </div>
        <div className="hidden px-3 py-2 text-sm font-black text-red-700 md:block">May 16, 2024&nbsp;&nbsp; 11:47 AM ET</div>
      </div>
    </div>
  );
}
