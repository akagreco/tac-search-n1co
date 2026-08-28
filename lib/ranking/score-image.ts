import { getRankingWeights } from "@/config/ranking";
import type { ImageContext, ImageResult, RawImageResult } from "@/types";
import { clampScore, normalizeText, queryTokens } from "@/lib/utils/text";

const graphicTerms = [
  "poster", "wallpaper", "edit", "fan art", "fanart", "collage", "meme", "thumbnail",
  "render", "fifa card", "ea fc", "instagram", "tiktok", "twitter", "sticker", "ai generated",
  "illustration", "vector", "graphic", "headline", "template",
];
const professionalSources = [
  "wikimedia", "getty", "apnews", "associated press", "reuters", "afp", "flickr", "pexels", "unsplash", "pixabay",
  "fifa.com", "uefa.com", "afa.com.ar", "conmebol.com", "espn", "tycsports", "ole.com.ar", "goal.com",
];

function resolutionLabel(width: number, height: number): ImageResult["resolutionLabel"] {
  const longEdge = Math.max(width, height);
  if (longEdge >= 7680) return "8K";
  if (longEdge >= 5760) return "6K";
  if (longEdge >= 3840) return "4K";
  if (longEdge >= 2560) return "2K";
  if (longEdge >= 1920) return "Full HD";
  if (longEdge >= 1280) return "HD";
  return "SD";
}

function classifyContext(text: string): ImageContext {
  if (/celebr|festej|trophy|trofeo|champion/.test(text)) return "celebration";
  if (/train|entren|practice/.test(text)) return "training";
  if (/press|conference|conferencia|microphone|interview/.test(text)) return "conference";
  if (/portrait|retrato|headshot|profile/.test(text)) return "portrait";
  if (/national|seleccion|argentina|world cup|copa america/.test(text)) return "national-team";
  if (/club|team|squad|plantel/.test(text)) return "club";
  if (/match|partido|game|football|soccer|stadium|goal/.test(text)) return "match";
  return "other";
}

function recencyScore(date?: string) {
  if (!date) return 48;
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return 48;
  const days = Math.max(0, (Date.now() - timestamp) / 86_400_000);
  if (days <= 7) return 100;
  if (days <= 30) return 92;
  if (days <= 180) return 82;
  if (days <= 365) return 72;
  if (days <= 1_095) return 60;
  return 45;
}

export function scoreImage(image: RawImageResult, query: string): ImageResult {
  const width = Math.max(0, image.width || 0);
  const height = Math.max(0, image.height || 0);
  const pixels = width * height;
  const megapixels = pixels / 1_000_000;
  const longEdge = Math.max(width, height);
  const shortEdge = Math.min(width, height);
  const aspectRatio = height ? width / height : 1;
  const titleText = normalizeText([image.title, image.description].filter(Boolean).join(" "));
  const text = normalizeText([image.title, image.description, image.tags?.join(" "), image.source, image.domain].filter(Boolean).join(" "));
  const graphicMatches = graphicTerms.filter((term) => text.includes(term)).length;
  const sourceTrust = professionalSources.some((source) => `${image.domain} ${image.source}`.toLowerCase().includes(source)) ? 90 : 65;
  const resolutionScore = longEdge >= 6000 ? 100 : longEdge >= 3840 ? 92 : longEdge >= 2560 ? 82 : longEdge >= 1920 ? 72 : longEdge >= 1280 ? 55 : 30;
  const fileScore = image.bytes ? Math.min(100, Math.max(30, Math.log10(Math.max(image.bytes, 10_000)) * 18 - 55)) : 62;
  const qualityScore = clampScore(resolutionScore * 0.6 + sourceTrust * 0.25 + fileScore * 0.15 - graphicMatches * 8);
  const cleanScore = clampScore(96 - graphicMatches * 24 - (image.watermarked ? 26 : 0));
  const watermarkTerms = /watermark|alamy|shutterstock|dreamstime|depositphotos|imago|marca de agua/.test(text);
  const watermarkScore = clampScore(image.watermarked ? 88 : watermarkTerms ? 72 : graphicMatches > 1 ? 32 : 8);
  const context = classifyContext(text);
  const visibilityScore = clampScore((shortEdge >= 1080 ? 82 : 62) + (context === "portrait" ? 14 : 0) + (context === "other" ? -8 : 4));
  const professionalScore = clampScore(sourceTrust + (graphicMatches ? -graphicMatches * 16 : 5));
  const sixteenNineDistance = Math.abs(aspectRatio - 16 / 9);
  const compositionScore = clampScore(88 - Math.min(35, sixteenNineDistance * 28) + (aspectRatio > 1 ? 6 : 0));
  const tokens = queryTokens(query);
  const matchingTokens = tokens.filter((token) => text.includes(token)).length;
  const matchingTitleTokens = tokens.filter((token) => titleText.includes(token)).length;
  const normalizedQuery = normalizeText(query);
  const relevanceScore = clampScore(tokens.length
    ? 15 + (matchingTokens / tokens.length) * 55 + (matchingTitleTokens / tokens.length) * 20 + (titleText.includes(normalizedQuery) ? 10 : 0) + (image.providerRank || 0) * 0.05
    : 70);
  const recent = recencyScore(image.publishedAt);
  const weights = getRankingWeights();
  const broadcastScore = clampScore(
    relevanceScore * weights.relevance +
    qualityScore * weights.quality +
    visibilityScore * weights.visibility +
    professionalScore * weights.professional +
    compositionScore * weights.composition +
    cleanScore * weights.clean +
    (100 - watermarkScore) * weights.watermark +
    recent * weights.recency,
  );
  const orientation = Math.abs(width - height) < Math.max(width, height) * 0.06 ? "square" : width > height ? "horizontal" : "vertical";

  return {
    ...image,
    width,
    height,
    megapixels: Number(megapixels.toFixed(1)),
    orientation,
    resolutionLabel: resolutionLabel(width, height),
    context,
    watermarkStatus: watermarkScore >= 65 ? "detected" : watermarkScore >= 30 ? "possible" : "clear",
    broadcastLabel: broadcastScore >= 85 ? "excellent" : broadcastScore >= 65 ? "usable" : "poor",
    scores: {
      qualityScore,
      broadcastScore,
      broadcastCleanScore: cleanScore,
      watermarkScore,
      relevanceScore,
      recencyScore: recent,
    },
    duplicateCount: 0,
    variants: [],
  };
}
