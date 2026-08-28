import dns from "node:dns/promises";
import net from "node:net";
import sharp from "sharp";
import type { RawImageResult } from "@/types";
import { createDHash } from "@/lib/deduplication/dhash";

const allowedImageHosts = [
  "upload.wikimedia.org", "images.unsplash.com", "images.pexels.com", "live.staticflickr.com",
  "cdn.openverse.org", "i0.wp.com", "i1.wp.com", "i2.wp.com",
];

function isPrivateAddress(address: string) {
  if (net.isIPv6(address)) return address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:");
  const parts = address.split(".").map(Number);
  return parts[0] === 10 || parts[0] === 127 || (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168) || parts[0] === 0;
}

async function assertSafeImageUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("URL de imagen no permitida");
  if (!allowedImageHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) throw new Error("Host no autorizado para análisis");
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("Destino de red no permitido");
  return url;
}

export async function analyzeRemoteImage(image: RawImageResult, signal: AbortSignal): Promise<RawImageResult> {
  if (process.env.ENABLE_REMOTE_IMAGE_ANALYSIS !== "true") return image;
  try {
    const url = await assertSafeImageUrl(image.thumbnailUrl);
    const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(4_500)]), redirect: "error" });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) return image;
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 6_000_000) return image;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > 6_000_000) return image;
    const pixels = await sharp(buffer).resize(9, 8, { fit: "fill" }).grayscale().raw().toBuffer();
    return { ...image, visualHash: createDHash(pixels, 9, 8) };
  } catch {
    return image;
  }
}

export async function analyzeBatch(images: RawImageResult[], signal: AbortSignal) {
  const limit = Math.min(images.length, Number(process.env.IMAGE_ANALYSIS_MAX_RESULTS || 12));
  const analyzed = await Promise.all(images.slice(0, limit).map((image) => analyzeRemoteImage(image, signal)));
  return [...analyzed, ...images.slice(limit)];
}
