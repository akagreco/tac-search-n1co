import type { RawImageResult } from "@/types";
import { fetchJson, type SearchProvider } from "./provider";

type OpenverseImage = {
  id: string;
  title?: string;
  thumbnail?: string;
  url?: string;
  foreign_landing_url?: string;
  width?: number;
  height?: number;
  creator?: string;
  license?: string;
  license_url?: string;
  created_on?: string;
  provider?: string;
  source?: string;
  tags?: { name: string }[];
  watermarked?: boolean;
};

export const openverseProvider: SearchProvider = {
  id: "openverse",
  name: "Openverse",
  requiresKey: false,
  coverage: "archive",
  isConfigured: () => true,
  async search(query, { page, signal, filters }) {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      page_size: "20",
      mature: "false",
    });
    if (filters.orientation === "horizontal") params.set("aspect_ratio", "wide");
    if (filters.orientation === "square") params.set("aspect_ratio", "square");
    if (filters.orientation === "vertical") params.set("aspect_ratio", "tall");
    const data = await fetchJson<{ results: OpenverseImage[] }>(
      `https://api.openverse.org/v1/images/?${params}`,
      { signal },
    );
    return data.results.flatMap<RawImageResult>((image, index) => {
      if (!image.thumbnail || !image.url || !image.foreign_landing_url) return [];
      let domain = "openverse.org";
      try { domain = new URL(image.foreign_landing_url).hostname; } catch { /* conservamos fallback */ }
      return [{
        id: `openverse:${image.id}`,
        providerId: "openverse",
        sourceId: image.id,
        title: image.title || `${query} — fotografía`,
        thumbnailUrl: image.thumbnail,
        originalUrl: image.url,
        sourceUrl: image.foreign_landing_url,
        width: image.width || 0,
        height: image.height || 0,
        author: image.creator || undefined,
        license: image.license?.toUpperCase() || "Licencia no verificada",
        licenseUrl: image.license_url || undefined,
        publishedAt: image.created_on || undefined,
        domain,
        source: image.provider || image.source || "Openverse",
        tags: image.tags?.map((tag) => tag.name).slice(0, 12),
        watermarked: image.watermarked,
        providerRank: 100 - index,
      }];
    });
  },
};
