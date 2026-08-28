import { createClient, type RedisClientType } from "redis";
import type { ImageResult } from "@/types";

type CacheEntry = { createdAt: number; results: ImageResult[] };
const memoryCache = new Map<string, CacheEntry>();
let redisClient: RedisClientType | null = null;
let redisConnection: Promise<RedisClientType | null> | null = null;

function keyFor(query: string) {
  return `tac-search:${query.trim().toLowerCase().replace(/\s+/g, " ")}`;
}

async function redis() {
  if (!process.env.REDIS_URL) return null;
  if (redisClient?.isOpen) return redisClient;
  if (!redisConnection) {
    redisConnection = (async () => {
      try {
        const client = createClient({ url: process.env.REDIS_URL });
        client.on("error", () => undefined);
        await client.connect();
        redisClient = client as RedisClientType;
        return redisClient;
      } catch {
        return null;
      }
    })();
  }
  return redisConnection;
}

export async function getCachedSearch(query: string): Promise<CacheEntry | null> {
  const key = keyFor(query);
  const client = await redis();
  if (client) {
    const value = await client.get(key);
    if (value) return JSON.parse(value) as CacheEntry;
  }
  return memoryCache.get(key) || null;
}

export async function setCachedSearch(query: string, results: ImageResult[]) {
  const key = keyFor(query);
  const entry: CacheEntry = { createdAt: Date.now(), results };
  memoryCache.set(key, entry);
  const ttl = Math.max(60, Number(process.env.SEARCH_CACHE_TTL_SECONDS || 900));
  const client = await redis();
  if (client) await client.set(key, JSON.stringify(entry), { EX: ttl });
  if (memoryCache.size > 100) {
    const oldest = [...memoryCache.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
    if (oldest) memoryCache.delete(oldest[0]);
  }
}
