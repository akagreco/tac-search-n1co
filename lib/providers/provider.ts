import type { ProviderId, RawImageResult, SearchFilters } from "@/types";
import { enableSystemCa } from "@/lib/security/system-ca";

export type ProviderSearchOptions = {
  page: number;
  filters: SearchFilters;
  signal: AbortSignal;
};

export interface SearchProvider {
  id: ProviderId;
  name: string;
  requiresKey: boolean;
  keyEnv?: string;
  coverage: "web" | "archive" | "stock" | "demo";
  isConfigured(): boolean;
  search(query: string, options: ProviderSearchOptions): Promise<RawImageResult[]>;
}

export async function fetchJson<T>(url: string, init: RequestInit, timeoutMs = 7_000): Promise<T> {
  enableSystemCa();
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  const response = await fetch(url, {
    ...init,
    signal,
    headers: {
      Accept: "application/json",
      "User-Agent": "TAC-Search/1.0 (production image research tool)",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`El proveedor respondió ${response.status}`);
  return response.json() as Promise<T>;
}
