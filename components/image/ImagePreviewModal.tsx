"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, Copy, ExternalLink, Images, Info, Link2, MonitorPlay, Search, X } from "lucide-react";
import type { ImageResult } from "@/types";
import { formatDate, formatMegapixels, formatResolution } from "@/lib/utils/image";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { WatermarkBadge } from "@/components/ui/WatermarkBadge";
import { BroadcastPreview } from "./BroadcastPreview";

type Props = {
  image: ImageResult;
  position: number;
  total: number;
  saved: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleSaved: () => void;
  onSimilar: () => void;
};

function ScoreRow({ label, score, inverse = false }: { label: string; score: number; inverse?: boolean }) {
  const display = inverse ? 100 - score : score;
  return <div className="score-row"><div><span>{label}</span><strong>{score}</strong></div><div className="score-track"><span style={{ width: `${display}%` }} /></div></div>;
}

export function ImagePreviewModal({ image, position, total, saved, onClose, onPrevious, onNext, onToggleSaved, onSimilar }: Props) {
  const [copied, setCopied] = useState(false);
  const [broadcastPreview, setBroadcastPreview] = useState(false);
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { if (broadcastPreview) setBroadcastPreview(false); else onClose(); }
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
      if (event.key.toLowerCase() === "f" && document.activeElement?.tagName !== "INPUT") onToggleSaved();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [broadcastPreview, onClose, onNext, onPrevious, onToggleSaved]);
  const copyLink = async () => {
    await navigator.clipboard.writeText(image.originalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1_500);
  };
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Detalle de ${image.title}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="image-modal">
        <div className="modal-topbar">
          <span>{position + 1} de {total}</span>
          <div><span className="keyboard-help">← → navegar · F guardar · Esc cerrar</span><button onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div>
        </div>
        <div className="modal-content">
          <section className="modal-image-zone">
            {broadcastPreview ? <BroadcastPreview image={image} onClose={() => setBroadcastPreview(false)} /> : <div className="full-image-wrap"><img src={image.originalUrl} alt={image.title} /><button className="modal-arrow left" onClick={onPrevious} aria-label="Imagen anterior"><ArrowLeft /></button><button className="modal-arrow right" onClick={onNext} aria-label="Imagen siguiente"><ArrowRight /></button></div>}
          </section>
          <aside className="image-details">
            <div className="detail-heading"><div className="source-line"><span>{image.source}</span><span>·</span><span>{image.domain}</span></div><h2>{image.title}</h2><div className="detail-badges"><ScoreBadge score={image.scores.broadcastScore} label={image.broadcastLabel} /><WatermarkBadge status={image.watermarkStatus} /></div></div>
            <div className="primary-actions">
              <button className="primary" onClick={() => setBroadcastPreview(true)}><MonitorPlay size={17} /> Vista previa</button>
              <button className={saved ? "saved" : ""} onClick={onToggleSaved}><Bookmark size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "Guardada" : "Guardar"}</button>
            </div>
            <div className="secondary-actions">
              <a href={image.originalUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Abrir original</a>
              <a href={image.sourceUrl} target="_blank" rel="noreferrer"><Link2 size={15} /> Ver fuente</a>
              <button onClick={copyLink}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copiado" : "Copiar enlace"}</button>
              <button onClick={onSimilar}><Search size={15} /> Ver similares</button>
            </div>
            <div className="detail-section"><h3>Información de archivo</h3><dl className="metadata-grid"><div><dt>Resolución</dt><dd>{formatResolution(image.width, image.height)}</dd></div><div><dt>Tamaño</dt><dd>{formatMegapixels(image.megapixels)}</dd></div><div><dt>Formato</dt><dd>{image.format?.toUpperCase() || "No informado"}</dd></div><div><dt>Fecha</dt><dd>{formatDate(image.publishedAt)}</dd></div><div><dt>Autor</dt><dd>{image.author || "No informado"}</dd></div><div><dt>Licencia</dt><dd>{image.license || "Licencia no verificada"}</dd></div></dl></div>
            <div className="detail-section"><h3>Análisis para programa</h3><div className="score-list"><ScoreRow label="Calidad" score={image.scores.qualityScore} /><ScoreRow label="Aptitud para programa" score={image.scores.broadcastScore} /><ScoreRow label="Limpieza visual" score={image.scores.broadcastCleanScore} /><ScoreRow label="Probabilidad de marca" score={image.scores.watermarkScore} inverse /></div></div>
            {image.duplicateCount > 0 && <div className="variants-note"><Images size={17} /><span><strong>{image.duplicateCount + 1} versiones agrupadas</strong>Se muestra la de mayor resolución.</span></div>}
            <div className="license-note"><Info size={16} /><p><strong>Verificá los derechos antes de emitir.</strong> Que no se detecte una marca de agua no implica que la foto sea libre de derechos.</p></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
