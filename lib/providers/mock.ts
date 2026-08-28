import type { RawImageResult } from "@/types";
import type { SearchProvider } from "./provider";

const footballPhotos = [
  "photo-1579952363873-27f3bade9f55",
  "photo-1553778263-73a83bab9b0c",
  "photo-1526232761682-d26e03ac148e",
  "photo-1431324155629-1a6deb1dec8d",
  "photo-1574629810360-7efbbe195018",
  "photo-1522778119026-d647f0596c20",
  "photo-1517927033932-b3d18e61fb3a",
  "photo-1540747913346-19e32dc3e97e",
];

const contexts = ["partido", "celebración", "entrenamiento", "retrato", "conferencia", "selección", "club", "partido"];

export const mockProvider: SearchProvider = {
  id: "mock",
  name: "Demostración TAC",
  requiresKey: false,
  coverage: "demo",
  isConfigured: () => true,
  async search(query, { page }) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return Array.from({ length: 18 }, (_, index): RawImageResult => {
      const photoIndex = index % footballPhotos.length;
      const photoId = footballPhotos[photoIndex];
      const width = index % 5 === 0 ? 2400 : index % 3 === 0 ? 4096 : 3200;
      const height = index % 4 === 0 ? 3200 : Math.round(width * 0.667);
      const base = `https://images.unsplash.com/${photoId}`;
      return {
        id: `mock:${page}:${index}`,
        providerId: "mock",
        sourceId: `${page}-${index}`,
        title: `${query} — ${contexts[photoIndex]} profesional`,
        description: "Resultado de demostración para probar el flujo de producción.",
        thumbnailUrl: `${base}?auto=format&fit=crop&w=900&q=78`,
        originalUrl: `${base}?auto=format&fit=max&w=${width}&q=90`,
        sourceUrl: "https://unsplash.com/s/photos/football",
        width,
        height,
        format: "jpg",
        author: "Fuente de demostración",
        license: "Demo — verificar licencia en origen",
        publishedAt: new Date(Date.now() - index * 7 * 86_400_000).toISOString(),
        domain: "unsplash.com",
        source: "Modo demostración",
        tags: [query, contexts[photoIndex], "football", index % 6 === 0 ? "poster" : "photo"],
        watermarked: index % 9 === 0,
        providerRank: 100 - index,
      };
    });
  },
};
