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

export type CmsHistoryStory = {
  _id: string;
  historyDate: string;
  headline: string;
  subheadline?: string;
  url?: string;
  imageUrl?: string;
  imageHidden?: boolean;
  year?: number;
  originalEvent?: string;
  placement: "hero" | "left" | "right" | "chaos";
  featureOnHomepage?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

export type SiteSettings = {
  historyFeatureLive: boolean;
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

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!projectId) return { historyFeatureLive: false };

  const query = encodeURIComponent(`*[_type == "siteSettings"][0]{ historyFeatureLive }`);

  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return { historyFeatureLive: false };
    const data = (await response.json()) as { result?: { historyFeatureLive?: boolean } };
    return { historyFeatureLive: data.result?.historyFeatureLive ?? false };
  } catch {
    return { historyFeatureLive: false };
  }
}

export async function getHistoryStories(date: string): Promise<CmsHistoryStory[]> {
  if (!projectId) return [];

  const query = encodeURIComponent(
    `*[_type == "historyStory" && historyDate == "${date}" && isActive != false] | order(sortOrder asc, _createdAt asc) {
      _id, historyDate, headline, subheadline, url, imageUrl, imageHidden,
      year, originalEvent, placement, featureOnHomepage, isActive, sortOrder
    }`,
  );

  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { result?: CmsHistoryStory[] };
    return data.result || [];
  } catch {
    return [];
  }
}

export async function getHomepageFeaturedHistoryStory(date: string): Promise<CmsHistoryStory | null> {
  if (!projectId) return null;

  const query = encodeURIComponent(
    `*[_type == "historyStory" && historyDate == "${date}" && featureOnHomepage == true && isActive != false][0] {
      _id, historyDate, headline, subheadline, url, imageUrl, imageHidden,
      year, originalEvent, placement, featureOnHomepage
    }`,
  );

  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { result?: CmsHistoryStory };
    return data.result ?? null;
  } catch {
    return null;
  }
}

export async function hasHistoryPage(date: string): Promise<boolean> {
  if (!projectId) return false;

  const query = encodeURIComponent(
    `count(*[_type == "historyStory" && historyDate == "${date}" && isActive != false]) > 0`,
  );

  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { result?: boolean };
    return data.result === true;
  } catch {
    return false;
  }
}

export function getTodayHistoryDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}
