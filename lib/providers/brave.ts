import type { RawImageResult } from "@/types";
import { fetchJson, type SearchProvider } from "./provider";

export type BraveImage = {
  title?: string;
  url?: string;
  source?: string;
  page_fetched?: string;
  thumbnail?: { src?: string; width?: number; height?: number };
  properties?: { url?: string; width?: number; height?: number };
  meta_url?: { hostname?: string };
  confidence?: "low" | "medium" | "high";
};

function domainFrom(url: string, fallback: string) {
  try { return new URL(url).hostname; } catch { return fallback; }
}

export function mapBraveImages(images: BraveImage[], query: string): RawImageResult[] {
  return images.flatMap((image, index) => {
    const thumbnail = image.thumbnail?.src;
    const original = image.properties?.url;
    const sourceUrl = image.url;
    if (!thumbnail || !original || !sourceUrl) return [];
    const domain = image.meta_url?.hostname || domainFrom(sourceUrl, image.source || "Fuente web");
    return [{
      id: `brave:${index + 1}:${encodeURIComponent(original).slice(-48)}`,
      providerId: "brave" as const,
      sourceId: String(index + 1),
      title: image.title || `${query} — resultado web`,
      thumbnailUrl: thumbnail,
      originalUrl: original,
      sourceUrl,
      width: image.properties?.width || 0,
      height: image.properties?.height || 0,
      publishedAt: image.page_fetched,
      license: "Derechos no verificados — revisar fuente",
      domain,
      source: image.source || domain,
      providerRank: Math.max(1, 100 - index - (image.confidence === "low" ? 20 : image.confidence === "medium" ? 7 : 0)),
    }];
  });
}

export const braveProvider: SearchProvider = {
  id: "brave",
  name: "Brave Image Search",
  requiresKey: true,
  keyEnv: "BRAVE_SEARCH_API_KEY",
  coverage: "web",
  isConfigured: () => Boolean(process.env.BRAVE_SEARCH_API_KEY),
  async search(query, { page, signal }) {
    const key = process.env.BRAVE_SEARCH_API_KEY;
    if (!key || page > 1) return [];
    const count = Math.max(10, Math.min(200, Number(process.env.WEB_RESULTS_PER_PROVIDER || 100)));
    const params = new URLSearchParams({
      q: query,
      country: (process.env.SEARCH_COUNTRY || "AR").toUpperCase(),
      search_lang: (process.env.SEARCH_LANGUAGE || "es").toLowerCase(),
      count: String(count),
      safesearch: "strict",
      spellcheck: "true",
    });
    const data = await fetchJson<{ results?: BraveImage[] }>(
      `https://api.search.brave.com/res/v1/images/search?${params}`,
      { signal, headers: { "X-Subscription-Token": key } },
      10_000,
    );
    return mapBraveImages(data.results || [], query);
  },
};
