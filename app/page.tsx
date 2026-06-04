import { Header } from "@/components/Header";
import { getCmsStories } from "@/lib/sanity";
import type { CmsStory } from "@/lib/sanity";

type DisplayStory = Pick<CmsStory, "_id" | "_createdAt" | "headline" | "subheadline" | "url" | "imageUrl" | "imageHidden" | "featured" | "publishedAt">;

function storyTime(story: DisplayStory) {
  return new Date(story.publishedAt || story._createdAt || 0).getTime();
}

function sortNewestFirst(stories: DisplayStory[]) {
  return [...stories].sort((a, b) => storyTime(b) - storyTime(a));
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function stableRandomizeChaos(stories: DisplayStory[]) {
  const seed = stories.map((story) => story._id).sort().join("|");
  return [...stories].sort((a, b) => hashString(`${seed}:${a._id}`) - hashString(`${seed}:${b._id}`));
}

function externalLinkProps(url?: string) {
  return url ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export default async function Home() {
  const cmsStories = await getCmsStories();
  const xProfileUrl = process.env.NEXT_PUBLIC_X_PROFILE_URL || "#";
  const cmsLeftStories = sortNewestFirst(cmsStories.filter((story) => story.placement === "left"));
  const cmsRightStories = sortNewestFirst(cmsStories.filter((story) => story.placement === "right" || story.placement === "top" || story.placement === "trending"));
  const cmsChaosStories = sortNewestFirst(cmsStories.filter((story) => story.placement === "chaos"));
  const cmsHeroStories = sortNewestFirst(cmsStories.filter((story) => story.placement === "hero" || story.placement === "main"));
  const cmsHeroStory = cmsHeroStories[0];
  const olderHeroStories = cmsHeroStories.slice(1);
  const activeMainStory = cmsHeroStory
    ? {
        headline: cmsHeroStory.headline,
        subheadline: cmsHeroStory.subheadline,
        imageUrl: cmsHeroStory.imageUrl,
        imageHidden: cmsHeroStory.imageHidden,
        url: cmsHeroStory.url,
      }
    : null;
  const leftPool: DisplayStory[] = cmsLeftStories;
  const rightPool: DisplayStory[] = [...olderHeroStories, ...cmsRightStories];
  const activeLeftLinks = leftPool.slice(0, 6);
  const activeRightStories = rightPool.slice(0, 6);
  const sideOverflow = [...leftPool.slice(6), ...rightPool.slice(6)];
  const baseChaosStories: DisplayStory[] = cmsChaosStories;
  const activeChaosStories = stableRandomizeChaos([...sideOverflow, ...baseChaosStories]);

  return (
    <main id="top" className="min-h-screen bg-white text-black">
      <Header />
      <div className="mx-auto max-w-[1500px] px-3 py-4">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1.6fr)_360px]">
          <section className="space-y-3 text-lg font-black uppercase leading-tight">
            {activeLeftLinks.map((story, index) => (
              <a key={story.headline} href={story.url || "#"} {...externalLinkProps(story.url)} className={`${index === 0 ? "text-red-700" : ""} block underline decoration-2 hover:bg-red-700 hover:text-white`}>
                {story.imageUrl && !story.imageHidden ? (
                  <img src={story.imageUrl} alt="" className="mb-2 h-auto w-full border-2 border-black object-cover grayscale contrast-125" loading="lazy" />
                ) : null}
                {story.headline}
              </a>
            ))}
          </section>
          <section className="text-center">
            {activeMainStory ? (
              <>
                {activeMainStory.imageUrl && !activeMainStory.imageHidden ? (
                  <div className="aspect-[16/10] overflow-hidden border border-zinc-300 bg-zinc-200">
                    <img src={activeMainStory.imageUrl} alt="" className="h-full w-full object-cover object-top grayscale contrast-125" loading="eager" />
                  </div>
                ) : null}
                <a href={activeMainStory.url || "#"} {...externalLinkProps(activeMainStory.url)} className="mt-3 block font-tabloid text-4xl uppercase leading-none tracking-tight text-red-700 hover:text-black md:text-6xl">
                  {activeMainStory.headline}
                </a>
                {activeMainStory.subheadline ? (
                  <p className="font-tabloid text-3xl uppercase italic leading-none tracking-tight md:text-5xl">
                    {activeMainStory.subheadline}
                  </p>
                ) : null}
              </>
            ) : null}
          </section>
          <aside>
            <div className="space-y-3 text-lg font-black uppercase leading-tight">
              {activeRightStories.map((story) => (
                <a key={story.headline} href={story.url || "#"} {...externalLinkProps(story.url)} className="block border-b-2 border-black pb-3 underline decoration-2 hover:bg-red-700 hover:text-white">
                  {story.imageUrl && !story.imageHidden ? (
                    <img src={story.imageUrl} alt="" className="mb-2 h-auto w-full border-2 border-black object-cover grayscale contrast-125" loading="lazy" />
                  ) : null}
                  {story.headline}
                </a>
              ))}
            </div>
          </aside>
        </div>
        <div className="mt-7 border-y-4 border-black py-3 text-center font-tabloid text-3xl uppercase leading-none md:text-5xl">
          No sections. No mercy. Just the hits.
        </div>
        <section className="mt-5 columns-1 gap-5 md:columns-3 xl:columns-4">
          {activeChaosStories.map((story, index) => (
            <a key={story.headline} href={story.url || "#"} {...externalLinkProps(story.url)} className={`${story.featured ? "text-3xl" : index % 4 === 0 ? "text-2xl" : "text-lg"} mb-4 block break-inside-avoid border-b-2 border-black pb-3 font-black uppercase leading-none underline decoration-2 hover:bg-red-700 hover:text-white`}>
              {story.imageUrl && !story.imageHidden ? (
                <img src={story.imageUrl} alt="" className="mb-2 h-auto w-full border-2 border-black object-cover grayscale contrast-125" loading="lazy" />
              ) : null}
              {story.headline}
            </a>
          ))}
        </section>
        <div className="my-7 bg-black px-5 py-7 text-center font-tabloid text-5xl uppercase italic leading-none text-white md:text-7xl" style={{ clipPath: "polygon(0 8%, 3% 0, 8% 7%, 14% 1%, 21% 8%, 29% 0, 36% 7%, 44% 2%, 52% 8%, 61% 0, 70% 7%, 78% 1%, 87% 8%, 95% 0, 100% 7%, 98% 92%, 93% 100%, 84% 93%, 75% 99%, 66% 92%, 58% 100%, 49% 93%, 41% 99%, 32% 92%, 24% 100%, 15% 93%, 7% 99%, 0 92%)" }}>
          Shut <span className="text-red-600">your</span> face.<br className="sm:hidden" /> Open <span className="text-red-600">your</span> eyes.
        </div>
        <footer className="bg-black p-5 text-white">
          <div className="grid gap-5 md:grid-cols-[1fr_1.2fr_1fr] md:items-center">
            <div>
              <p className="font-tabloid text-3xl uppercase">Get the news first</p>
              <p className="text-sm">Join the list for new stories, site updates, and zero corporate fluff.</p>
            </div>
            <form className="flex gap-3">
              <input aria-label="Footer email address" type="email" placeholder="Enter your email" className="min-h-12 flex-1 px-4 text-black" />
              <button type="submit" className="bg-red-700 px-5 font-tabloid text-2xl uppercase text-white hover:bg-white hover:text-black">Subscribe now</button>
            </form>
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
