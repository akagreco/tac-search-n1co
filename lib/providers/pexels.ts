import type { RawImageResult } from "@/types";
import { fetchJson, type SearchProvider } from "./provider";

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  alt?: string;
  photographer?: string;
  src: { medium?: string; large2x?: string; original?: string };
};

export const pexelsProvider: SearchProvider = {
  id: "pexels",
  name: "Pexels",
  requiresKey: true,
  keyEnv: "PEXELS_API_KEY",
  coverage: "stock",
  isConfigured: () => Boolean(process.env.PEXELS_API_KEY),
  async search(query, { page, signal, filters }) {
    const key = process.env.PEXELS_API_KEY;
    if (!key) return [];
    const params = new URLSearchParams({ query, page: String(page), per_page: "30", locale: "es-ES" });
    if (filters.resolution !== "all") params.set("size", filters.resolution === "full-hd" ? "small" : filters.resolution === "2k" ? "medium" : "large");
    if (filters.orientation !== "all") params.set("orientation", filters.orientation === "square" ? "square" : filters.orientation === "horizontal" ? "landscape" : "portrait");
    const data = await fetchJson<{ photos: PexelsPhoto[] }>(
      `https://api.pexels.com/v1/search?${params}`,
      { signal, headers: { Authorization: key } },
    );
    return data.photos.flatMap<RawImageResult>((photo, index) => {
      if (!photo.src.medium || !photo.src.original) return [];
      return [{
        id: `pexels:${photo.id}`,
        providerId: "pexels",
        sourceId: String(photo.id),
        title: photo.alt || `${query} — Pexels`,
        thumbnailUrl: photo.src.large2x || photo.src.medium,
        originalUrl: photo.src.original,
        sourceUrl: photo.url,
        width: photo.width,
        height: photo.height,
        author: photo.photographer,
        license: "Licencia Pexels (verificar uso)",
        domain: "pexels.com",
        source: "Pexels",
        providerRank: 100 - index,
      }];
    });
  },
};
