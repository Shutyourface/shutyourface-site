type AdBannerProps = {
  label: string;
};

export function AdBanner({ label }: AdBannerProps) {
  return (
    <aside className="flex min-h-24 items-center justify-center border-4 border-dashed border-red-700 bg-white p-4 text-center font-mono text-xs font-black uppercase text-red-700 dark:bg-zinc-950 dark:text-red-400">
      {label} Ad Placeholder
    </aside>
  );
}
