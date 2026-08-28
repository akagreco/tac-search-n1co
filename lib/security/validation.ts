import { z } from "zod";
import { defaultFilters } from "@/types";

const filterSchema = z.object({
  quality: z.enum(["all", "high", "very-high"]).optional(),
  resolution: z.enum(["all", "full-hd", "2k", "4k", "6k"]).optional(),
  orientation: z.enum(["all", "horizontal", "vertical", "square"]).optional(),
  program: z.enum(["broadcast", "all"]).optional(),
  watermark: z.enum(["prefer-clear", "all", "hide-possible"]).optional(),
  type: z.enum(["all", "match", "portrait", "celebration", "training", "conference", "club", "national-team", "other"]).optional(),
  date: z.enum(["all", "day", "week", "month", "year"]).optional(),
  sort: z.enum(["broadcast", "quality", "resolution", "recent", "relevant", "watermark"]).optional(),
}).strict().optional();

export const searchRequestSchema = z.object({
  query: z.string().trim().min(2, "Escribí al menos 2 caracteres").max(100, "La búsqueda es demasiado larga"),
  filters: filterSchema,
  page: z.number().int().min(1).max(10).default(1),
}).strict().transform((value) => ({
  ...value,
  query: value.query.replace(/[<>\u0000-\u001F]/g, "").replace(/\s+/g, " "),
  filters: { ...defaultFilters, ...value.filters },
}));

export function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}
