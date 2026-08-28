import { CircleCheck, CircleDot, TriangleAlert } from "lucide-react";
import type { BroadcastLabel } from "@/types";

const labels: Record<BroadcastLabel, string> = {
  excellent: "Excelente para programa",
  usable: "Utilizable",
  poor: "Poco recomendable",
};

export function ScoreBadge({ score, label, compact = false }: { score: number; label: BroadcastLabel; compact?: boolean }) {
  const Icon = label === "excellent" ? CircleCheck : label === "usable" ? CircleDot : TriangleAlert;
  return <span className={`score-badge ${label} ${compact ? "compact" : ""}`} title={labels[label]}><Icon size={compact ? 13 : 15} /><strong>{score}</strong>{!compact && <span>{labels[label]}</span>}</span>;
}
