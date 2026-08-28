import { describe, expect, it } from "vitest";
import { scoreImage } from "@/lib/ranking/score-image";
import type { RawImageResult } from "@/types";

function image(overrides: Partial<RawImageResult> = {}): RawImageResult {
  return {
    id: "test:1", providerId: "wikimedia", sourceId: "1", title: "Lionel Messi match celebration",
    thumbnailUrl: "https://upload.wikimedia.org/thumb.jpg", originalUrl: "https://upload.wikimedia.org/original.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:test", width: 5000, height: 3333,
    domain: "commons.wikimedia.org", source: "Wikimedia Commons", publishedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("broadcast ranking", () => {
  it("favorece una fotografía profesional y limpia frente a un póster 8K", () => {
    const clean = scoreImage(image(), "Lionel Messi");
    const poster = scoreImage(image({ id: "test:2", width: 7680, height: 4320, title: "Lionel Messi fan edit wallpaper poster thumbnail with text", watermarked: true }), "Lionel Messi");
    expect(clean.scores.broadcastScore).toBeGreaterThan(poster.scores.broadcastScore);
    expect(clean.scores.broadcastCleanScore).toBeGreaterThan(poster.scores.broadcastCleanScore);
    expect(poster.scores.watermarkScore).toBeGreaterThan(clean.scores.watermarkScore);
  });

  it("clasifica los umbrales de aptitud", () => {
    const result = scoreImage(image(), "Lionel Messi");
    expect(result.scores.broadcastScore).toBeGreaterThanOrEqual(0);
    expect(result.scores.broadcastScore).toBeLessThanOrEqual(100);
    expect(["excellent", "usable", "poor"]).toContain(result.broadcastLabel);
  });

  it("prioriza una coincidencia exacta frente a una foto genérica de igual calidad", () => {
    const exact = scoreImage(image({ title: "Lionel Messi festeja un gol con Inter Miami" }), "Lionel Messi Inter Miami");
    const generic = scoreImage(image({ id: "test:3", title: "Jugador profesional festeja un gol de fútbol" }), "Lionel Messi Inter Miami");
    expect(exact.scores.relevanceScore).toBeGreaterThan(generic.scores.relevanceScore);
    expect(exact.scores.broadcastScore).toBeGreaterThan(generic.scores.broadcastScore);
  });
});
