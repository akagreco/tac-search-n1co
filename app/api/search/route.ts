import { NextRequest } from "next/server";
import type { ProviderId, RawImageResult, SearchStreamEvent } from "@/types";
import { getCachedSearch, setCachedSearch } from "@/lib/cache/search-cache";
import { analyzeBatch } from "@/lib/image-analysis/remote-analysis";
import { getConfiguredProviders, getMockProvider } from "@/lib/providers/registry";
import { queryForProvider } from "@/lib/providers/query-expansion";
import { rankResults } from "@/lib/ranking/rank-results";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { safeExternalUrl, searchRequestSchema } from "@/lib/security/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicError(error: unknown) {
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") return "El proveedor tardó demasiado";
    if (/429/.test(error.message)) return "Límite temporal del proveedor";
  }
  return "Proveedor temporalmente no disponible";
}

export async function POST(request: NextRequest) {
  const identity = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const rate = checkRateLimit(identity);
  if (!rate.allowed) {
    return Response.json(
      { error: "Demasiadas búsquedas. Esperá unos segundos y volvé a intentar." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  let parsed;
  try {
    parsed = searchRequestSchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Búsqueda inválida";
    return Response.json({ error: message }, { status: 400 });
  }

  const { query, filters, page } = parsed;
  const encoder = new TextEncoder();
  const startedAt = Date.now();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: SearchStreamEvent) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)); } catch { closed = true; }
      };

      const providers = getConfiguredProviders();
      send({ type: "status", message: "Buscando las mejores fotos en Internet...", providers: providers.length });

      const cached = await getCachedSearch(query);
      if (cached?.results.length) {
        send({ type: "cached", results: cached.results, ageSeconds: Math.round((Date.now() - cached.createdAt) / 1_000) });
      }

      const accumulated: RawImageResult[] = [];
      let providersSucceeded = 0;
      let providersFailed = 0;
      const providerIds = new Set<ProviderId>();

      await Promise.all(providers.map(async (provider, index) => {
        const providerStartedAt = Date.now();
        try {
          const providerQuery = queryForProvider(query, index);
          const rawResults = await provider.search(providerQuery, { page, filters, signal: request.signal });
          const validResults = rawResults.filter((image) =>
            safeExternalUrl(image.thumbnailUrl) && safeExternalUrl(image.originalUrl) && safeExternalUrl(image.sourceUrl),
          );
          const analyzed = await analyzeBatch(validResults, request.signal);
          accumulated.push(...analyzed);
          providersSucceeded += 1;
          providerIds.add(provider.id);
          const ranked = rankResults(accumulated, query);
          send({ type: "provider", providerId: provider.id, results: ranked, elapsedMs: Date.now() - providerStartedAt });
        } catch (error) {
          providersFailed += 1;
          send({ type: "provider-error", providerId: provider.id, message: publicError(error) });
        }
      }));

      const mockMode = (process.env.MOCK_MODE || "auto").toLowerCase();
      if (accumulated.length === 0 && mockMode !== "false") {
        try {
          const mock = getMockProvider();
          accumulated.push(...await mock.search(query, { page, filters, signal: request.signal }));
          providersSucceeded += 1;
          providerIds.add("mock");
          send({ type: "provider", providerId: "mock", results: rankResults(accumulated, query), elapsedMs: Date.now() - startedAt });
        } catch {
          providersFailed += 1;
        }
      }

      const results = rankResults(accumulated, query);
      if (results.length) await setCachedSearch(query, results);
      const duplicates = results.reduce((sum, result) => sum + result.duplicateCount, 0);
      const mode = providerIds.size === 1 && providerIds.has("mock") ? "mock" : providerIds.has("mock") ? "hybrid" : "live";
      send({
        type: "complete",
        results,
        summary: {
          found: results.length,
          excellent: results.filter((image) => image.broadcastLabel === "excellent").length,
          duplicates,
          watermarksFiltered: results.filter((image) => image.scores.watermarkScore >= 35).length,
          providersSucceeded,
          providersFailed,
        },
        elapsedMs: Date.now() - startedAt,
        mode,
      });
      if (!closed) controller.close();
    },
    cancel() {
      // El request.signal cancela las llamadas de proveedores en curso.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-RateLimit-Remaining": String(rate.remaining),
    },
  });
}
