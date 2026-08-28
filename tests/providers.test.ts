import { describe, expect, it } from "vitest";
import { mapBraveImages } from "@/lib/providers/brave";
import { mapFlickrImages } from "@/lib/providers/flickr";
import { mapPixabayImages } from "@/lib/providers/pixabay";
import { mapSerpApiImages } from "@/lib/providers/serpapi";

describe("normalización de proveedores", () => {
  it("convierte resultados de Google Images y omite contenido inseguro", () => {
    const results = mapSerpApiImages([
      { position: 1, title: "Lionel Messi Inter Miami", thumbnail: "https://thumb.test/messi.jpg", original: "https://media.test/messi.jpg", original_width: 4000, original_height: 2667, link: "https://sports.test/messi", source: "Sports", unsafe: false },
      { position: 2, thumbnail: "https://thumb.test/x.jpg", original: "https://media.test/x.jpg", link: "https://unsafe.test/x", unsafe: true },
    ], "Lionel Messi");
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ providerId: "serpapi", width: 4000, domain: "sports.test" });
  });

  it("conserva la imagen original y la página fuente de Brave", () => {
    const [result] = mapBraveImages([{ title: "Argentina campeón", url: "https://news.test/article", source: "News", thumbnail: { src: "https://imgs.search.brave.com/a.jpg" }, properties: { url: "https://news.test/original.jpg", width: 3000, height: 2000 }, confidence: "high" }], "Argentina campeón");
    expect(result.originalUrl).toBe("https://news.test/original.jpg");
    expect(result.sourceUrl).toBe("https://news.test/article");
  });

  it("usa la mejor variante disponible de Flickr y Pixabay", () => {
    const [flickr] = mapFlickrImages([{ id: "1", owner: "owner", title: "Partido", url_c: "https://live.staticflickr.com/c.jpg", width_c: 800, height_c: 533, url_o: "https://live.staticflickr.com/o.jpg", width_o: "5000", height_o: "3333" }], "Partido");
    const [pixabay] = mapPixabayImages([{ id: 2, pageURL: "https://pixabay.com/photos/2", tags: "football, match", webformatURL: "https://pixabay.com/preview.jpg", imageURL: "https://pixabay.com/original.jpg", imageWidth: 4200, imageHeight: 2800 }], "Partido");
    expect(flickr).toMatchObject({ originalUrl: "https://live.staticflickr.com/o.jpg", width: 5000 });
    expect(pixabay).toMatchObject({ originalUrl: "https://pixabay.com/original.jpg", width: 4200 });
  });
});
