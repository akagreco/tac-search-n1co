import type { ImageResult } from "@/types";

export function formatResolution(width: number, height: number) {
  return `${Math.max(0, width).toLocaleString("es-AR")} × ${Math.max(0, height).toLocaleString("es-AR")}`;
}

export function formatMegapixels(megapixels: number) {
  return `${megapixels.toLocaleString("es-AR", { maximumFractionDigits: 1 })} MP`;
}

export function formatDate(value?: string) {
  if (!value) return "Fecha no disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

const resolutionMinimums = { all: 0, "full-hd": 1920, "2k": 2560, "4k": 3840, "6k": 5760 } as const;

export function filterAndSortResults(
  results: ImageResult[],
  filters: import("@/types").SearchFilters,
) {
  const now = Date.now();
  const ageLimit = {
    all: Number.POSITIVE_INFINITY,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000,
    year: 31_536_000_000,
  }[filters.date];

  const filtered = results.filter((image) => {
    if (filters.quality === "high" && image.scores.qualityScore < 70) return false;
    if (filters.quality === "very-high" && image.scores.qualityScore < 85) return false;
    if (filters.resolution !== "all" && Math.max(image.width, image.height) < resolutionMinimums[filters.resolution]) return false;
    if (filters.orientation !== "all" && image.orientation !== filters.orientation) return false;
    if (filters.program === "broadcast" && image.scores.broadcastScore < 50) return false;
    if (filters.watermark === "hide-possible" && image.scores.watermarkScore >= 35) return false;
    if (filters.type !== "all" && image.context !== filters.type) return false;
    if (filters.date !== "all") {
      if (!image.publishedAt) return false;
      const timestamp = new Date(image.publishedAt).getTime();
      if (Number.isNaN(timestamp) || now - timestamp > ageLimit) return false;
    }
    return true;
  });

  const scoreFor = (image: ImageResult) => {
    switch (filters.sort) {
      case "quality": return image.scores.qualityScore;
      case "resolution": return image.width * image.height;
      case "recent": return image.publishedAt ? new Date(image.publishedAt).getTime() : 0;
      case "relevant": return image.scores.relevanceScore;
      case "watermark": return 100 - image.scores.watermarkScore;
      default: return image.scores.broadcastScore;
    }
  };

  return [...filtered].sort((a, b) => {
    if (filters.watermark === "prefer-clear") {
      const watermarkDifference = a.scores.watermarkScore - b.scores.watermarkScore;
      if (Math.abs(watermarkDifference) >= 40) return watermarkDifference;
    }
    return scoreFor(b) - scoreFor(a);
  });
}
