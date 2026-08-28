export type RankingWeights = {
  relevance: number;
  quality: number;
  visibility: number;
  professional: number;
  composition: number;
  clean: number;
  watermark: number;
  recency: number;
};

function readWeight(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function getRankingWeights(): RankingWeights {
  const configured: RankingWeights = {
    relevance: readWeight("RANK_RELEVANCE_WEIGHT", 0.24),
    quality: readWeight("RANK_QUALITY_WEIGHT", 0.18),
    visibility: readWeight("RANK_VISIBILITY_WEIGHT", 0.14),
    professional: readWeight("RANK_PROFESSIONAL_WEIGHT", 0.12),
    composition: readWeight("RANK_COMPOSITION_WEIGHT", 0.1),
    clean: readWeight("RANK_CLEAN_WEIGHT", 0.08),
    watermark: readWeight("RANK_WATERMARK_WEIGHT", 0.07),
    recency: readWeight("RANK_RECENCY_WEIGHT", 0.07),
  };
  const total = Object.values(configured).reduce((sum, value) => sum + value, 0);
  if (total <= 0) return getDefaultWeights();
  return Object.fromEntries(
    Object.entries(configured).map(([key, value]) => [key, value / total]),
  ) as RankingWeights;
}

export function getDefaultWeights(): RankingWeights {
  return {
    relevance: 0.24,
    quality: 0.18,
    visibility: 0.14,
    professional: 0.12,
    composition: 0.1,
    clean: 0.08,
    watermark: 0.07,
    recency: 0.07,
  };
}
