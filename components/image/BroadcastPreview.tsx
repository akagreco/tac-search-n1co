"use client";

import { useState } from "react";
import { Crop, Maximize, MonitorPlay, X } from "lucide-react";
import type { ImageResult } from "@/types";

export function BroadcastPreview({ image, onClose }: { image: ImageResult; onClose: () => void }) {
  const [fit, setFit] = useState<"contain" | "cover">("contain");
  return (
    <div className="broadcast-preview-panel">
      <div className="broadcast-preview-head"><div><span><MonitorPlay size={16} /> Vista previa en programa</span><small>Canvas simulado · 1920 × 1080</small></div><button onClick={onClose} aria-label="Cerrar vista previa"><X size={18} /></button></div>
      <div className="broadcast-canvas">
        <div className="safe-area" aria-hidden="true" />
        <img src={image.originalUrl} alt={`Vista previa de ${image.title}`} style={{ objectFit: fit }} />
        <span className="canvas-label">PROGRAM 1920 × 1080</span>
      </div>
      <div className="broadcast-controls" role="group" aria-label="Ajuste de vista previa">
        <button className={fit === "contain" ? "active" : ""} onClick={() => setFit("contain")}><Maximize size={15} /> Imagen completa</button>
        <button className={fit === "cover" ? "active" : ""} onClick={() => setFit("cover")}><Crop size={15} /> Llenar 16:9</button>
        <span>Solo comprobación: no modifica la imagen.</span>
      </div>
    </div>
  );
}
