import type { RawImageResult } from "@/types";
import type { SearchProvider } from "./provider";
import { enableSystemCa } from "@/lib/security/system-ca";

export type PixabayImage = {
  id: number;
  pageURL?: string;
  tags?: string;
  previewURL?: string;
  webformatURL?: string;
  webformatWidth?: number;
  webformatHeight?: number;
  largeImageURL?: string;
  imageURL?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageSize?: number;
  user?: string;
};

function displayDimensions(image: PixabayImage, usesOriginal: boolean) {
  if (usesOriginal) return { width: image.imageWidth || 0, height: image.imageHeight || 0 };
  const width = image.imageWidth || image.webformatWidth || 0;
  const height = image.imageHeight || image.webformatHeight || 0;
  const scale = Math.max(width, height) > 1280 ? 1280 / Math.max(width, height) : 1;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function mapPixabayImages(images: PixabayImage[], query: string): RawImageResult[] {
  return images.flatMap((image, index) => {
    const thumbnail = image.webformatURL || image.previewURL;
    const original = image.imageURL || image.largeImageURL;
    if (!thumbnail || !original || !image.pageURL) return [];
    const dimensions = displayDimensions(image, Boolean(image.imageURL));
    return [{
      id: `pixabay:${image.id}`,
      providerId: "pixabay" as const,
      sourceId: String(image.id),
      title: image.tags || `${query} — Pixabay`,
      thumbnailUrl: thumbnail,
      originalUrl: original,
      sourceUrl: image.pageURL,
      width: dimensions.width,
      height: dimensions.height,
      bytes: image.imageURL ? image.imageSize : undefined,
      author: image.user,
      license: "Pixabay Content License — verificar condiciones",
      licenseUrl: "https://pixabay.com/service/license-summary/",
      domain: "pixabay.com",
      source: "Pixabay",
      tags: image.tags?.split(",").map((tag) => tag.trim()),
      providerRank: 100 - index,
    }];
  });
}

export const pixabayProvider: SearchProvider = {
  id: "pixabay",
  name: "Pixabay",
  requiresKey: true,
  keyEnv: "PIXABAY_API_KEY",
  coverage: "stock",
  isConfigured: () => Boolean(process.env.PIXABAY_API_KEY),
  async search(query, { page, signal, filters }) {
    const key = process.env.PIXABAY_API_KEY;
    if (!key) return [];
    const params = new URLSearchParams({ key, q: query.slice(0, 100), lang: (process.env.SEARCH_LANGUAGE || "es").toLowerCase(), image_type: "photo", safesearch: "true", order: "popular", page: String(page), per_page: "30" });
    if (filters.orientation === "horizontal" || filters.orientation === "vertical") params.set("orientation", filters.orientation);
    const minWidth = filters.resolution === "all" ? undefined : { "full-hd": "1920", "2k": "2560", "4k": "3840", "6k": "5760" }[filters.resolution];
    if (minWidth) params.set("min_width", minWidth);
    enableSystemCa();
    const response = await fetch(`https://pixabay.com/api/?${params}`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(8_000)]),
      headers: { Accept: "application/json", "User-Agent": "TAC-Search/1.0" },
      next: { revalidate: 86_400 },
    });
    if (!response.ok) throw new Error(`El proveedor respondió ${response.status}`);
    const data = await response.json() as { hits?: PixabayImage[] };
    return mapPixabayImages(data.hits || [], query);
  },
};
