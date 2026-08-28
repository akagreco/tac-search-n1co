import { describe, expect, it } from "vitest";
import { safeExternalUrl, searchRequestSchema } from "@/lib/security/validation";

describe("validación y seguridad", () => {
  it("normaliza una búsqueda válida", () => {
    const parsed = searchRequestSchema.parse({ query: "  Lionel   Messi  " });
    expect(parsed.query).toBe("Lionel Messi");
    expect(parsed.filters.program).toBe("broadcast");
  });

  it("rechaza búsquedas vacías y payloads desconocidos", () => {
    expect(() => searchRequestSchema.parse({ query: "x" })).toThrow();
    expect(() => searchRequestSchema.parse({ query: "Messi", admin: true })).toThrow();
  });

  it("impide destinos locales y protocolos peligrosos", () => {
    expect(safeExternalUrl("https://upload.wikimedia.org/photo.jpg")).toBe(true);
    expect(safeExternalUrl("http://127.0.0.1/secret")).toBe(false);
    expect(safeExternalUrl("file:///etc/passwd")).toBe(false);
  });
});
