import { getProviderStatuses } from "@/lib/providers/registry";
import { getRankingWeights } from "@/config/ranking";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    providers: getProviderStatuses(),
    rankingWeights: getRankingWeights(),
    remoteAnalysis: process.env.ENABLE_REMOTE_IMAGE_ANALYSIS === "true",
    cache: process.env.REDIS_URL ? "redis" : "memory",
  });
}
