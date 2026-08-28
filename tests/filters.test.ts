import { describe, expect, it } from "vitest";
import { filterAndSortResults } from "@/lib/utils/image";
import { defaultFilters } from "@/types";
import { scoreImage } from "@/lib/ranking/score-image";

const base = {
  providerId: "mock" as const, sourceId: "1", title: "Jugador football match", thumbnailUrl: "https://images.unsplash.com/a",
  originalUrl: "https://images.unsplash.com/a", sourceUrl: "https://unsplash.com/a", domain: "unsplash.com", source: "Unsplash",
};

describe("filtros", () => {
  it("filtra por orientación y resolución", () => {
    const horizontal = scoreImage({ ...base, id: "h", width: 4000, height: 2200 }, "Jugador");
    const vertical = scoreImage({ ...base, id: "v", sourceId: "2", originalUrl: "https://images.unsplash.com/b", width: 1200, height: 2000 }, "Jugador");
    const results = filterAndSortResults([vertical, horizontal], { ...defaultFilters, orientation: "horizontal", resolution: "4k" });
    expect(results.map((item) => item.id)).toEqual(["h"]);
  });
});
