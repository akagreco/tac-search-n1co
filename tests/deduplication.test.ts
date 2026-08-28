import { describe, expect, it } from "vitest";
import { createDHash, hammingDistance } from "@/lib/deduplication/dhash";
import { deduplicateResults } from "@/lib/deduplication/deduplicate";
import { scoreImage } from "@/lib/ranking/score-image";
import type { RawImageResult } from "@/types";

const base: RawImageResult = {
  id: "a", providerId: "mock", sourceId: "a", title: "Jugador en partido", thumbnailUrl: "https://images.unsplash.com/photo/thumb",
  originalUrl: "https://images.unsplash.com/photo/demo?q=70", sourceUrl: "https://unsplash.com/photos/demo", width: 1200, height: 800,
  domain: "unsplash.com", source: "Unsplash",
};

describe("deduplicación perceptual", () => {
  it("agrupa URLs canónicas y conserva la versión de mayor resolución", () => {
    const low = scoreImage(base, "Jugador");
    const high = scoreImage({ ...base, id: "b", sourceId: "b", originalUrl: "https://images.unsplash.com/photo/demo?q=95&w=6000", width: 6000, height: 4000 }, "Jugador");
    const grouped = deduplicateResults([low, high]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].width).toBe(6000);
    expect(grouped[0].duplicateCount).toBe(1);
  });

  it("calcula y compara hashes dHash de 64 bits", () => {
    const pixels = Uint8Array.from({ length: 72 }, (_, index) => index % 9);
    const hash = createDHash(pixels);
    expect(hash).toMatch(/^[0-9a-f]{16}$/);
    expect(hammingDistance(hash, hash)).toBe(0);
  });
});
