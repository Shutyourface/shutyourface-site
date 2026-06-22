import type { CmsStory } from "@/lib/sanity";

export type DisplayStory = Pick<CmsStory, "_id" | "_createdAt" | "headline" | "subheadline" | "url" | "imageUrl" | "imageHidden" | "featured" | "publishedAt">;

export const HOMEPAGE_CHAOS_LIMIT = 36;
export const MORE_FACE_LIMIT = 100;

export function storyTime(story: DisplayStory) {
  return new Date(story.publishedAt || story._createdAt || 0).getTime();
}

export function sortNewestFirst(stories: DisplayStory[]) {
  return [...stories].sort((a, b) => storyTime(b) - storyTime(a));
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function stableRandomizeChaos(stories: DisplayStory[]) {
  const seed = stories.map((story) => story._id).sort().join("|");
  return [...stories].sort((a, b) => hashString(`${seed}:${a._id}`) - hashString(`${seed}:${b._id}`));
}

export function externalLinkProps(url?: string) {
  return url ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function getChaosStyles(storyId: string, featured: boolean): { fontSize: string; margin: string; italic: boolean; red: boolean; underline: boolean; } {
  // Stable hash based on story ID
  const hash = storyId.split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0);

  if (featured) {
    return { fontSize: "text-3xl", margin: "mb-8", italic: true, red: true, underline: true };
  }

  // Use hash to pick styles
  const sizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl"];
  const margins = ["mb-2", "mb-3", "mb-4", "mb-5", "mb-6", "mb-8", "mb-10"];

  return {
    fontSize: sizes[hash % sizes.length],
    margin: margins[(hash >> 4) % margins.length],
    italic: (hash >> 8) % 3 === 0, // 1/3 chance italic
    red: (hash >> 12) % 5 === 0, // 1/5 chance red text
    underline: (hash >> 16) % 2 === 0, // 1/2 chance underline
  };
}

export function reorderForColumns(stories: DisplayStory[], numCols: number): DisplayStory[] {
  const numRows = Math.ceil(stories.length / numCols);
  const result: DisplayStory[] = [];
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      const idx = row * numCols + col;
      if (idx < stories.length) result.push(stories[idx]);
    }
  }
  return result;
}

export function distributeToColumns(stories: DisplayStory[], columnCount: number): DisplayStory[][] {
  const columns: DisplayStory[][] = Array.from({ length: columnCount }, () => []);
  stories.forEach((story, index) => {
    columns[index % columnCount].push(story);
  });
  return columns;
}

export function distributeToColumnsBalanced(stories: DisplayStory[], columnCount: number): DisplayStory[][] {
  const columns: DisplayStory[][] = Array.from({ length: columnCount }, () => []);

  for (const story of stories) {
    // Find the shortest column
    const shortestIndex = columns.reduce((minIdx, col, i) =>
      col.length < columns[minIdx].length ? i : minIdx, 0);
    columns[shortestIndex].push(story);
  }

  return columns;
}

export function distributeToColumnsWithImageConstraint(stories: DisplayStory[], columnCount: number): DisplayStory[][] {
  const columns: DisplayStory[][] = Array.from({ length: columnCount }, () => []);
  const rowHasImage: boolean[] = [];

  for (const story of stories) {
    const hasImage = !!story.imageUrl && !story.imageHidden;
    let placed = false;

    for (let row = 0; row < 100; row++) {
      const colForThisRow = row % columnCount;
      const targetColumn = columns[colForThisRow];

      // Check if this row already has this many stories in this column
      if (targetColumn.length <= row) {
        // Row exists in this column (or is being created)
        const rowAlreadyHasImage = rowHasImage[row] || false;

        if (hasImage && rowAlreadyHasImage) {
          // Can't place image here, try next row
          continue;
        }

        // Place the story
        targetColumn.push(story);
        if (hasImage) {
          rowHasImage[row] = true;
        }
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Fallback: just append to shortest column
      const shortestCol = columns.reduce((min, col, i) => col.length < columns[min].length ? i : min, 0);
      columns[shortestCol].push(story);
    }
  }

  return columns;
}

export function buildStoryLayout(cmsStories: CmsStory[]) {
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
  const rightPool: DisplayStory[] = sortNewestFirst([...olderHeroStories, ...cmsRightStories]);
  const activeLeftLinks = leftPool.slice(0, 6);
  const activeRightStories = rightPool.slice(0, 6);
  const sideOverflow = [...leftPool.slice(6), ...rightPool.slice(6)];
  const activeChaosPool = sortNewestFirst([...sideOverflow, ...cmsChaosStories]);
  const activeChaosPoolLimited = activeChaosPool.slice(0, HOMEPAGE_CHAOS_LIMIT);
  const moreFaceStories = activeChaosPool.slice(HOMEPAGE_CHAOS_LIMIT, HOMEPAGE_CHAOS_LIMIT + MORE_FACE_LIMIT);
  const activeChaosColumns = distributeToColumnsBalanced(activeChaosPoolLimited, 4);

  return {
    activeMainStory,
    activeLeftLinks,
    activeRightStories,
    activeChaosStories: activeChaosPoolLimited,
    activeChaosColumns,
    moreFaceStories,
  };
}
