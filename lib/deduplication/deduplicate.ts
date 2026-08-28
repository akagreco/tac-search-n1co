import type { ImageResult, RawImageResult } from "@/types";
import { hammingDistance } from "./dhash";

function normalizedUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname.toLowerCase()}${decodeURIComponent(url.pathname).toLowerCase()}`.replace(/\/(thumb|thumbnail)\//g, "/");
  } catch {
    return value.toLowerCase().split("?")[0];
  }
}

function rawVersion(image: ImageResult): RawImageResult {
  return {
    id: image.id, providerId: image.providerId, sourceId: image.sourceId, title: image.title,
    description: image.description, thumbnailUrl: image.thumbnailUrl, originalUrl: image.originalUrl,
    sourceUrl: image.sourceUrl, width: image.width, height: image.height, bytes: image.bytes,
    format: image.format, author: image.author, license: image.license, licenseUrl: image.licenseUrl,
    publishedAt: image.publishedAt, domain: image.domain, source: image.source, tags: image.tags,
    watermarked: image.watermarked, providerRank: image.providerRank, visualHash: image.visualHash,
  };
}

function isDuplicate(left: ImageResult, right: ImageResult) {
  if (normalizedUrl(left.originalUrl) === normalizedUrl(right.originalUrl)) return true;
  if (left.visualHash && right.visualHash && hammingDistance(left.visualHash, right.visualHash) <= 6) return true;
  return false;
}

export function deduplicateResults(results: ImageResult[]) {
  const groups: ImageResult[][] = [];
  for (const result of results) {
    const group = groups.find((candidate) => isDuplicate(candidate[0], result));
    if (group) group.push(result);
    else groups.push([result]);
  }
  return groups.map((group) => {
    const ordered = [...group].sort((a, b) => (b.width * b.height) - (a.width * a.height) || b.scores.broadcastScore - a.scores.broadcastScore);
    const [best, ...variants] = ordered;
    return {
      ...best,
      duplicateCount: variants.length,
      variants: variants.map(rawVersion),
    };
  });
}
