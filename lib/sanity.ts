export type CmsStory = {
  _id: string;
  _createdAt?: string;
  headline: string;
  url?: string;
  imageUrl?: string;
  imageHidden?: boolean;
  placement: "hero" | "main" | "left" | "right" | "top" | "trending" | "chaos";
  subheadline?: string;
  featured?: boolean;
  publishedAt?: string;
  isActive?: boolean;
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2025-05-28";

export async function getCmsStories(): Promise<CmsStory[]> {
  if (!projectId) {
    return [];
  }

  const query = encodeURIComponent(
    `*[_type == "story" && isActive != false] {
      headline,
      _id,
      _createdAt,
      url,
      imageUrl,
      imageHidden,
      placement,
      subheadline,
      featured,
      publishedAt,
      isActive
    }`,
  );

  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { result?: CmsStory[] };
    return data.result || [];
  } catch {
    return [];
  }
}
