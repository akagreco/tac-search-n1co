"use client";

import { useState } from "react";
import { Bookmark, Check, Copy, Images, Maximize2 } from "lucide-react";
import type { ImageResult } from "@/types";
import { formatMegapixels, formatResolution } from "@/lib/utils/image";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

type Props = { image: ImageResult; saved: boolean; onOpen: () => void; onToggleSaved: () => void };

export function ImageCard({ image, saved, onOpen, onToggleSaved }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const ratio = image.width && image.height ? image.width / image.height : 1.45;
  const copy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(image.originalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1_500);
  };
  return (
    <article
      className="image-card"
      role="button"
      tabIndex={0}
      aria-label={`Abrir ${image.title}`}
      onClick={onOpen}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(); } }}
    >
      <div className="image-card-media" style={{ aspectRatio: String(Math.max(0.55, Math.min(2, ratio))) }}>
        {!loaded && <div className="image-skeleton" />}
        <img src={image.thumbnailUrl} alt={image.title} loading="lazy" onLoad={() => setLoaded(true)} onError={(event) => { event.currentTarget.style.display = "none"; }} />
        <div className="image-top-meta"><ScoreBadge score={image.scores.broadcastScore} label={image.broadcastLabel} compact />{image.duplicateCount > 0 && <span className="duplicate-badge"><Images size={13} /> +{image.duplicateCount}</span>}</div>
        <div className="card-actions">
          <button onClick={(event) => { event.stopPropagation(); onToggleSaved(); }} aria-label={saved ? "Quitar de guardadas" : "Guardar imagen"} className={saved ? "saved" : ""}><Bookmark size={17} fill={saved ? "currentColor" : "none"} /></button>
          <button onClick={copy} aria-label="Copiar enlace">{copied ? <Check size={17} /> : <Copy size={17} />}</button>
          <span><Maximize2 size={17} /></span>
        </div>
        <div className="card-overlay"><span>{formatResolution(image.width, image.height)}</span><span>{formatMegapixels(image.megapixels)}</span><span>{image.source}</span></div>
      </div>
      <div className="image-card-caption"><p>{image.title}</p><div><span>{image.resolutionLabel}</span><span className={`watermark-dot ${image.watermarkStatus}`} /> <span>{image.watermarkStatus === "clear" ? "Sin marca aparente" : image.watermarkStatus === "possible" ? "Posible marca" : "Marca detectada"}</span></div></div>
    </article>
  );
}
