import type { ImageResult, RawImageResult } from "@/types";
import { deduplicateResults } from "@/lib/deduplication/deduplicate";
import { scoreImage } from "./score-image";

export function rankResults(results: RawImageResult[], query: string): ImageResult[] {
  const scored = results.map((image) => scoreImage(image, query));
  return deduplicateResults(scored).sort((a, b) => b.scores.broadcastScore - a.scores.broadcastScore);
}
