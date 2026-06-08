import { Header } from "@/components/Header";
import { getCmsStories } from "@/lib/sanity";
import { buildStoryLayout, externalLinkProps } from "@/lib/storyLayout";

export default async function MoreFacePage() {
  const cmsStories = await getCmsStories();
  const { moreFaceStories } = buildStoryLayout(cmsStories);

  return (
    <main id="top" className="min-h-screen bg-white text-black">
      <Header />
      <div className="mx-auto max-w-[1500px] px-3 py-4">
        <div className="border-y-4 border-black py-4 text-center font-tabloid text-6xl uppercase leading-none md:text-8xl">
          More Face
        </div>
        <div className="mt-4 flex items-center justify-between border-b-2 border-black pb-3 font-mono text-xs font-black uppercase tracking-[0.2em]">
          <a href="/" className="text-red-700 underline decoration-2 hover:bg-red-700 hover:text-white">
            ← Back to front page
          </a>
          <span>{moreFaceStories.length} extra stories</span>
        </div>
        {moreFaceStories.length ? (
          <section className="mt-5 columns-1 gap-5 md:columns-3 xl:columns-4">
            {moreFaceStories.map((story, index) => (
              <a key={story._id || story.headline} href={story.url || "#"} {...externalLinkProps(story.url)} className={`${story.featured ? "text-3xl" : index % 4 === 0 ? "text-2xl" : "text-lg"} mb-4 block break-inside-avoid border-b-2 border-black pb-3 font-black uppercase leading-none underline decoration-2 hover:bg-red-700 hover:text-white`}>
                {story.imageUrl && !story.imageHidden ? (
                  <img src={story.imageUrl} alt="" className="mb-2 h-auto w-full border-2 border-black object-cover grayscale contrast-125" loading="lazy" />
                ) : null}
                {story.headline}
              </a>
            ))}
          </section>
        ) : (
          <div className="py-20 text-center font-tabloid text-5xl uppercase leading-none text-red-700">
            No extra face yet.
          </div>
        )}
      </div>
    </main>
  );
}
