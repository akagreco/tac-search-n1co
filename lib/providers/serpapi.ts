import type { RawImageResult } from "@/types";
import { fetchJson, type SearchProvider } from "./provider";

export type SerpApiImage = {
  position?: number;
  thumbnail?: string;
  original?: string;
  original_width?: number;
  original_height?: number;
  title?: string;
  link?: string;
  source?: string;
  tag?: string;
  license_details_url?: string;
  unsafe?: boolean;
};

function configuredKey() {
  return process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY;
}

function domainFrom(url: string, fallback: string) {
  try { return new URL(url).hostname; } catch { return fallback; }
}

function imageSizeFilter(resolution: string) {
  if (resolution === "6k") return "20mp";
  if (resolution === "4k") return "8mp";
  if (resolution === "2k") return "4mp";
  if (resolution === "full-hd") return "2mp";
  return "l";
}

export function mapSerpApiImages(images: SerpApiImage[], query: string): RawImageResult[] {
  return images.flatMap((image, index) => {
    if (!image.thumbnail || !image.original || !image.link || image.unsafe) return [];
    const source = image.source || domainFrom(image.link, "Fuente web");
    return [{
      id: `serpapi:${image.position || index + 1}:${encodeURIComponent(image.original).slice(-48)}`,
      providerId: "serpapi" as const,
      sourceId: String(image.position || index + 1),
      title: image.title || `${query} — resultado web`,
      description: image.tag,
      thumbnailUrl: image.thumbnail,
      originalUrl: image.original,
      sourceUrl: image.link,
      width: image.original_width || 0,
      height: image.original_height || 0,
      license: image.license_details_url ? "Licencia indicada en la fuente" : "Derechos no verificados — revisar fuente",
      licenseUrl: image.license_details_url,
      domain: domainFrom(image.link, source),
      source,
      providerRank: 100 - index,
    }];
  });
}

export const serpApiProvider: SearchProvider = {
  id: "serpapi",
  name: "Google Images (SerpApi)",
  requiresKey: true,
  keyEnv: "SERPAPI_API_KEY",
  coverage: "web",
  isConfigured: () => Boolean(configuredKey()),
  async search(query, { page, signal, filters }) {
    const key = configuredKey();
    if (!key) return [];
    const country = (process.env.SEARCH_COUNTRY || "AR").toLowerCase();
    const language = (process.env.SEARCH_LANGUAGE || "es").toLowerCase();
    const params = new URLSearchParams({
      engine: "google_images",
      api_key: key,
      q: query,
      ijn: String(page - 1),
      hl: language,
      gl: country,
      safe: "active",
      image_type: "photo",
      imgsz: imageSizeFilter(filters.resolution),
    });
    if (filters.orientation === "horizontal") params.set("imgar", "w");
    if (filters.orientation === "vertical") params.set("imgar", "t");
    if (filters.orientation === "square") params.set("imgar", "s");
    const period = filters.date === "all" ? undefined : { day: "d", week: "w", month: "m", year: "y" }[filters.date];
    if (period) params.set("period_unit", period);
    const data = await fetchJson<{ images_results?: SerpApiImage[] }>(
      `https://serpapi.com/search.json?${params}`,
      { signal },
      10_000,
    );
    return mapSerpApiImages(data.images_results || [], query);
  },
};
