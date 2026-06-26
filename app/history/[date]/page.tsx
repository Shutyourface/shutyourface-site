import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { MailchimpSignup } from "@/components/MailchimpSignup";
import { getHistoryStories } from "@/lib/sanity";
import { externalLinkProps } from "@/lib/storyLayout";

export const revalidate = 60;

function formatHistoryDate(dateStr: string): string {
  const [m, d] = dateStr.split("-").map(Number);
  if (!m || !d || m < 1 || m > 12 || d < 1 || d > 31) return dateStr;
  return new Date(2000, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export async function generateMetadata({ params }: { params: { date: string } }) {
  return {
    title: `On This Day — ${formatHistoryDate(params.date)} | ShutYourFace`,
    description: `History headlines for ${formatHistoryDate(params.date)} from ShutYourFace.com`,
  };
}

export default async function HistoryPage({ params }: { params: { date: string } }) {
  const { date } = params;

  if (!/^\d{2}-\d{2}$/.test(date)) notFound();

  const stories = await getHistoryStories(date);
  const heroStory = stories.find((s) => s.placement === "hero") ?? null;
  const leftStories = stories.filter((s) => s.placement === "left");
  const rightStories = stories.filter((s) => s.placement === "right");
  const chaosStories = stories.filter((s) => s.placement === "chaos");
  const formattedDate = formatHistoryDate(date);
  const xProfileUrl = process.env.NEXT_PUBLIC_X_PROFILE_URL || "https://x.com/SYF_News";

  return (
    <main id="top" className="min-h-screen bg-white text-black">
      <Header />
      <div className="mx-auto max-w-[1500px] px-3 py-4">

        {/* Tab toggle */}
        <div className="mb-5 flex border-2 border-black">
          <a href="/" className="flex-1 px-4 py-2 text-center font-tabloid text-xl uppercase hover:bg-red-700 hover:text-white">
            ← Today&apos;s News
          </a>
          <span className="flex-1 bg-black px-4 py-2 text-center font-tabloid text-xl uppercase text-white">
            On This Day
          </span>
        </div>

        {/* Date header */}
        <div className="mb-5 border-y-4 border-black py-3 text-center font-tabloid text-3xl uppercase leading-none md:text-5xl">
          On This Day — {formattedDate}
        </div>

        {stories.length === 0 ? (
          <div className="py-20 text-center font-tabloid text-3xl uppercase text-zinc-300">
            No stories published for this date yet.
          </div>
        ) : (
          <>
            {/* 3-column grid */}
            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1.6fr)_360px]">

              {/* Left column */}
              <section className="space-y-3 text-lg font-black uppercase leading-tight">
                {leftStories.map((story, index) => (
                  <a key={story._id} href={story.url || "#"} {...externalLinkProps(story.url)}
                     className={`${index === 0 ? "text-red-700" : ""} block underline decoration-2 hover:bg-red-700 hover:text-white`}>
                    {story.imageUrl && !story.imageHidden ? (
                      <img src={story.imageUrl} alt="" className="mb-2 h-auto w-full border-2 border-black object-cover grayscale contrast-125" loading="lazy" />
                    ) : null}
                    {story.year ? <span className="block font-tabloid text-2xl text-red-700">{story.year}</span> : null}
                    {story.headline}
                  </a>
                ))}
              </section>

              {/* Hero */}
              <section className="text-center">
                {heroStory ? (
                  <>
                    {heroStory.imageUrl && !heroStory.imageHidden ? (
                      <div className="aspect-[16/10] overflow-hidden border border-zinc-300 bg-zinc-200">
                        <img src={heroStory.imageUrl} alt="" className="h-full w-full object-cover object-top" loading="eager" />
                      </div>
                    ) : null}
                    {heroStory.year ? <p className="mt-2 font-tabloid text-4xl text-red-700">{heroStory.year}</p> : null}
                    <a href={heroStory.url || "#"} {...externalLinkProps(heroStory.url)}
                       className="mt-2 block font-tabloid text-4xl uppercase leading-none tracking-tight text-red-700 hover:text-black md:text-6xl">
                      {heroStory.headline}
                    </a>
                    {heroStory.subheadline ? (
                      <p className="font-tabloid text-3xl uppercase italic leading-none tracking-tight md:text-5xl">
                        {heroStory.subheadline}
                      </p>
                    ) : null}
                    {heroStory.secondaryLinkEnabled && heroStory.secondaryLinkHeadline ? (
                      <a href={heroStory.secondaryLinkUrl || "#"} {...externalLinkProps(heroStory.secondaryLinkUrl)} className="mt-4 block border-2 border-black px-4 py-3 font-black uppercase leading-tight underline decoration-2 hover:bg-red-700 hover:text-white">
                        {heroStory.secondaryLinkHeadline}
                      </a>
                    ) : null}
                  </>
                ) : null}
              </section>

              {/* Right column */}
              <aside>
                <div className="space-y-3 text-lg font-black uppercase leading-tight">
                  {rightStories.map((story) => (
                    <a key={story._id} href={story.url || "#"} {...externalLinkProps(story.url)}
                       className="block border-b-2 border-black pb-3 underline decoration-2 hover:bg-red-700 hover:text-white">
                      {story.imageUrl && !story.imageHidden ? (
                        <img src={story.imageUrl} alt="" className="mb-2 h-auto w-full border-2 border-black object-cover grayscale contrast-125" loading="lazy" />
                      ) : null}
                      {story.year ? <span className="block font-tabloid text-2xl text-red-700">{story.year}</span> : null}
                      {story.headline}
                    </a>
                  ))}
                </div>
              </aside>
            </div>

            {/* Chaos */}
            {chaosStories.length > 0 && (
              <>
                <div className="mt-7 border-y-4 border-black py-3 text-center font-tabloid text-3xl uppercase leading-none md:text-5xl">
                  More from this day in history
                </div>
                <section className="mt-5 grid grid-cols-4 items-start gap-5">
                  {[0, 1, 2, 3].map((col) => (
                    <div key={col} className="flex flex-col gap-5">
                      {chaosStories.filter((_, i) => i % 4 === col).map((story) => (
                        <a key={story._id} href={story.url || "#"} {...externalLinkProps(story.url)}
                           className="block text-lg font-black uppercase leading-tight underline decoration-2 hover:bg-red-700 hover:text-white">
                          {story.imageUrl && !story.imageHidden ? (
                            <img src={story.imageUrl} alt="" className="mb-2 h-32 w-full border-2 border-black object-cover object-[center_20%] grayscale contrast-125" loading="lazy" />
                          ) : null}
                          {story.year ? <span className="block font-tabloid text-xl text-red-700">{story.year}</span> : null}
                          {story.headline}
                        </a>
                      ))}
                    </div>
                  ))}
                </section>
              </>
            )}
          </>
        )}

        <div className="my-7 bg-black px-5 py-7 text-center font-tabloid text-5xl uppercase italic leading-none text-white md:text-7xl" style={{ clipPath: "polygon(0 8%, 3% 0, 8% 7%, 14% 1%, 21% 8%, 29% 0, 36% 7%, 44% 2%, 52% 8%, 61% 0, 70% 7%, 78% 1%, 87% 8%, 95% 0, 100% 7%, 98% 92%, 93% 100%, 84% 93%, 75% 99%, 66% 92%, 58% 100%, 49% 93%, 41% 99%, 32% 92%, 24% 100%, 15% 93%, 7% 99%, 0 92%)" }}>
          Shut <span className="text-red-600">your</span> face.<br className="sm:hidden" /> Open <span className="text-red-600">your</span> eyes.
        </div>
        <footer className="bg-black p-5 text-white">
          <div className="grid gap-5 md:grid-cols-[1fr_1.2fr_1fr] md:items-center">
            <div>
              <p className="font-tabloid text-3xl uppercase">Get the news first</p>
              <p className="text-sm">Join the list for new stories, site updates, and zero corporate fluff.</p>
            </div>
            <MailchimpSignup variant="footer" />
            <div className="font-tabloid text-2xl uppercase">
              Follow us{" "}
              <a href={xProfileUrl} className="text-red-500 underline decoration-2 hover:text-white">
                on X
              </a>
            </div>
          </div>
          <div className="mt-5 border-t border-zinc-700 pt-4 text-center text-sm">
            <p>© 2026 ShutYourFace.com | All rights reserved.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
