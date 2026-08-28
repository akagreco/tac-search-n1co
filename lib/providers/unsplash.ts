import { fetchJson, type SearchProvider } from "./provider";

type UnsplashPhoto = {
  id: string;
  width: number;
  height: number;
  created_at?: string;
  description?: string;
  alt_description?: string;
  links: { html: string; download?: string };
  urls: { regular: string; full: string };
  user?: { name?: string };
};

export const unsplashProvider: SearchProvider = {
  id: "unsplash",
  name: "Unsplash",
  requiresKey: true,
  keyEnv: "UNSPLASH_ACCESS_KEY",
  coverage: "stock",
  isConfigured: () => Boolean(process.env.UNSPLASH_ACCESS_KEY),
  async search(query, { page, signal, filters }) {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) return [];
    const params = new URLSearchParams({ query, page: String(page), per_page: "30", content_filter: "high" });
    if (filters.orientation === "horizontal") params.set("orientation", "landscape");
    if (filters.orientation === "vertical") params.set("orientation", "portrait");
    if (filters.orientation === "square") params.set("orientation", "squarish");
    const data = await fetchJson<{ results: UnsplashPhoto[] }>(
      `https://api.unsplash.com/search/photos?${params}`,
      { signal, headers: { Authorization: `Client-ID ${key}` } },
    );
    return data.results.map((photo, index) => ({
      id: `unsplash:${photo.id}`,
      providerId: "unsplash" as const,
      sourceId: photo.id,
      title: photo.alt_description || photo.description || `${query} — Unsplash`,
      description: photo.description || undefined,
      thumbnailUrl: photo.urls.regular,
      originalUrl: photo.urls.full,
      sourceUrl: photo.links.html,
      width: photo.width,
      height: photo.height,
      author: photo.user?.name,
      license: "Licencia Unsplash (verificar uso)",
      publishedAt: photo.created_at,
      domain: "unsplash.com",
      source: "Unsplash",
      providerRank: 100 - index,
    }));
  },
};
