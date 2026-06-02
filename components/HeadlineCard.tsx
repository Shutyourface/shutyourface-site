export type Story = {
  title: string;
  source: string;
  section: string;
  image?: string;
  urgent?: boolean;
};

type HeadlineCardProps = {
  story: Story;
  variant?: "main" | "secondary" | "compact";
};

export function HeadlineCard({ story, variant = "secondary" }: HeadlineCardProps) {
  if (variant === "main") {
    return (
      <article className="border-4 border-black bg-white p-3 shadow-slash dark:border-white dark:bg-zinc-950">
        <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs font-black uppercase text-red-700 dark:text-red-400">
          <span>{story.section}</span>
          <span>{story.source}</span>
        </div>
        <a href="#" className="font-tabloid text-5xl uppercase leading-[0.85] tracking-tighter text-black hover:text-red-700 md:text-8xl dark:text-white dark:hover:text-red-500">
          {story.title}
        </a>
        {story.image ? (
          <div className="mt-4 aspect-[16/9] overflow-hidden border-4 border-black bg-red-700 dark:border-white">
            <img src={story.image} alt="" className="h-full w-full object-cover grayscale contrast-150" loading="eager" />
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article className="group border-b-2 border-black py-3 dark:border-white">
      <a href="#" className="grid grid-cols-[84px_1fr] gap-3 md:grid-cols-[96px_1fr]">
        {story.image ? (
          <img src={story.image} alt="" className="h-20 w-full border-2 border-black object-cover grayscale transition group-hover:grayscale-0 dark:border-white" loading="lazy" />
        ) : (
          <div className="h-20 border-2 border-black bg-red-700 dark:border-white" />
        )}
        <div>
          <p className="font-mono text-[10px] font-black uppercase text-red-700 dark:text-red-400">{story.section} / {story.source}</p>
          <h2 className={`${variant === "compact" ? "text-xl" : "text-2xl"} font-tabloid uppercase leading-none tracking-tight group-hover:text-red-700 dark:group-hover:text-red-500`}>
            {story.urgent ? <span className="mr-1 bg-red-700 px-1 text-white">Siren</span> : null}
            {story.title}
          </h2>
        </div>
      </a>
    </article>
  );
}
