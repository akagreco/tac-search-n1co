export type ProviderId =
  | "serpapi"
  | "brave"
  | "openverse"
  | "wikimedia"
  | "flickr"
  | "pexels"
  | "unsplash"
  | "pixabay"
  | "mock";

export type ImageContext =
  | "match"
  | "portrait"
  | "celebration"
  | "training"
  | "conference"
  | "club"
  | "national-team"
  | "other";

export type WatermarkStatus = "clear" | "possible" | "detected";
export type BroadcastLabel = "excellent" | "usable" | "poor";

export type ImageScores = {
  qualityScore: number;
  broadcastScore: number;
  broadcastCleanScore: number;
  watermarkScore: number;
  relevanceScore: number;
  recencyScore: number;
};

export type RawImageResult = {
  id: string;
  providerId: ProviderId;
  sourceId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  originalUrl: string;
  sourceUrl: string;
  width: number;
  height: number;
  bytes?: number;
  format?: string;
  author?: string;
  license?: string;
  licenseUrl?: string;
  publishedAt?: string;
  domain: string;
  source: string;
  tags?: string[];
  watermarked?: boolean;
  providerRank?: number;
  visualHash?: string;
};

export type ImageResult = RawImageResult & {
  megapixels: number;
  orientation: "horizontal" | "vertical" | "square";
  resolutionLabel: "SD" | "HD" | "Full HD" | "2K" | "4K" | "6K" | "8K";
  context: ImageContext;
  watermarkStatus: WatermarkStatus;
  broadcastLabel: BroadcastLabel;
  scores: ImageScores;
  duplicateCount: number;
  variants: RawImageResult[];
};

export type SearchFilters = {
  quality: "all" | "high" | "very-high";
  resolution: "all" | "full-hd" | "2k" | "4k" | "6k";
  orientation: "all" | "horizontal" | "vertical" | "square";
  program: "broadcast" | "all";
  watermark: "prefer-clear" | "all" | "hide-possible";
  type: "all" | ImageContext;
  date: "all" | "day" | "week" | "month" | "year";
  sort: "broadcast" | "quality" | "resolution" | "recent" | "relevant" | "watermark";
};

export const defaultFilters: SearchFilters = {
  quality: "all",
  resolution: "all",
  orientation: "all",
  program: "broadcast",
  watermark: "prefer-clear",
  type: "all",
  date: "all",
  sort: "broadcast",
};

export type SearchRequest = {
  query: string;
  filters?: Partial<SearchFilters>;
  page?: number;
};

export type SearchStreamEvent =
  | { type: "status"; message: string; providers: number }
  | { type: "cached"; results: ImageResult[]; ageSeconds: number }
  | { type: "provider"; providerId: ProviderId; results: ImageResult[]; elapsedMs: number }
  | { type: "provider-error"; providerId: ProviderId; message: string }
  | {
      type: "complete";
      results: ImageResult[];
      summary: SearchSummary;
      elapsedMs: number;
      mode: "live" | "mock" | "hybrid";
    }
  | { type: "error"; message: string };

export type SearchSummary = {
  found: number;
  excellent: number;
  duplicates: number;
  watermarksFiltered: number;
  providersSucceeded: number;
  providersFailed: number;
};

export type RecentSearch = { query: string; searchedAt: string; resultCount: number };
export type SavedImage = ImageResult & { savedAt: string };
export type Collection = { id: string; name: string; createdAt: string; imageIds: string[] };
