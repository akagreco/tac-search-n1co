import { braveProvider } from "./brave";
import { flickrProvider } from "./flickr";
import { mockProvider } from "./mock";
import { openverseProvider } from "./openverse";
import { pexelsProvider } from "./pexels";
import { pixabayProvider } from "./pixabay";
import type { SearchProvider } from "./provider";
import { serpApiProvider } from "./serpapi";
import { unsplashProvider } from "./unsplash";
import { wikimediaProvider } from "./wikimedia";

const liveProviders: SearchProvider[] = [
  serpApiProvider,
  braveProvider,
  openverseProvider,
  wikimediaProvider,
  flickrProvider,
  pexelsProvider,
  unsplashProvider,
  pixabayProvider,
];

export function getConfiguredProviders() {
  const mockMode = (process.env.MOCK_MODE || "auto").toLowerCase();
  if (mockMode === "true" || mockMode === "only") return [mockProvider];
  const disabled = new Set((process.env.DISABLED_PROVIDERS || "").toLowerCase().split(",").map((id) => id.trim()).filter(Boolean));
  return liveProviders.filter((provider) => provider.isConfigured() && !disabled.has(provider.id));
}

export function getMockProvider() {
  return mockProvider;
}

export function getProviderStatuses() {
  const disabled = new Set((process.env.DISABLED_PROVIDERS || "").toLowerCase().split(",").map((id) => id.trim()).filter(Boolean));
  return [...liveProviders, mockProvider].map((provider) => ({
    id: provider.id,
    name: provider.name,
    configured: provider.id === "mock" ? true : provider.isConfigured(),
    requiresKey: provider.requiresKey,
    keyEnv: provider.keyEnv,
    coverage: provider.coverage,
    enabled: !disabled.has(provider.id),
  }));
}
