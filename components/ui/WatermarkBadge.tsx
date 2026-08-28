import { BadgeCheck, BadgeHelp, BadgeX } from "lucide-react";
import type { WatermarkStatus } from "@/types";

const content = {
  clear: { label: "Sin marca aparente", Icon: BadgeCheck },
  possible: { label: "Posible marca", Icon: BadgeHelp },
  detected: { label: "Marca detectada", Icon: BadgeX },
};

export function WatermarkBadge({ status }: { status: WatermarkStatus }) {
  const { label, Icon } = content[status];
  return <span className={`watermark-badge ${status}`}><Icon size={14} />{label}</span>;
}
