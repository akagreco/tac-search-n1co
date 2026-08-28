"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Database, Gauge, KeyRound, Radio, RefreshCw, Server, Shield, Sparkles } from "lucide-react";

type Status = {
  providers: Array<{ id: string; name: string; configured: boolean; enabled: boolean; requiresKey: boolean; keyEnv?: string; coverage: "web" | "archive" | "stock" | "demo" }>;
  rankingWeights: Record<string, number>;
  remoteAnalysis: boolean;
  cache: string;
};

const weightLabels: Record<string, string> = { relevance: "Coincidencia con la búsqueda", quality: "Calidad y resolución", visibility: "Jugador visible", professional: "Aspecto profesional", composition: "Composición", clean: "Limpieza visual", watermark: "Ausencia de watermark", recency: "Actualidad" };
const coverageLabels = { web: "Web", archive: "Archivo", stock: "Banco", demo: "Respaldo" } as const;

export function SettingsPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { fetch("/api/providers").then((response) => response.json()).then(setStatus).catch(() => setFailed(true)); }, []);
  return (
    <div className="settings-page page-container">
      <header className="page-heading"><div><span className="section-kicker"><Gauge size={15} /> Configuración del sistema</span><h1>Ajustes</h1><p>Estado de proveedores, ranking y servicios de TAC Search.</p></div></header>
      {failed && <div className="error-state"><RefreshCw size={24} /><p>No se pudo leer la configuración.</p></div>}
      {!status && !failed ? <div className="library-skeleton" /> : status && <div className="settings-grid">
        <section className="settings-card providers-card"><div className="settings-card-title"><span><Server size={19} /></span><div><h2>Fuentes de búsqueda</h2><p>Ocho fuentes reales se consultan en paralelo y se ordenan juntas.</p></div></div><div className="provider-list">{status.providers.map((provider) => <div key={provider.id}><span className={provider.configured && provider.enabled ? "provider-state online" : "provider-state optional"}>{provider.configured && provider.enabled ? <CheckCircle2 size={16} /> : <KeyRound size={16} />}</span><span><strong>{provider.name}</strong><small>{!provider.enabled ? "Desactivada por configuración" : provider.configured ? "Lista para buscar" : provider.keyEnv ? `Falta ${provider.keyEnv}` : "No configurada"}</small></span><em>{coverageLabels[provider.coverage]}</em></div>)}</div></section>
        <section className="settings-card"><div className="settings-card-title"><span className="gold"><Sparkles size={19} /></span><div><h2>Broadcast Score</h2><p>Ponderaciones activas del ranking 0–100.</p></div></div><div className="weights-list">{Object.entries(status.rankingWeights).map(([key, value]) => <div key={key}><div><span>{weightLabels[key] || key}</span><strong>{Math.round(value * 100)}%</strong></div><div><span style={{ width: `${value * 100}%` }} /></div></div>)}</div></section>
        <section className="settings-card compact-card"><div className="settings-card-title"><span><Database size={19} /></span><div><h2>Caché</h2><p>{status.cache === "redis" ? "Redis conectado" : "Memoria local del servidor"}</p></div></div><span className="status-chip"><CheckCircle2 size={15} /> Activa</span></section>
        <section className="settings-card compact-card"><div className="settings-card-title"><span><Shield size={19} /></span><div><h2>Análisis remoto</h2><p>dHash y análisis visual protegido contra SSRF.</p></div></div><span className={`status-chip ${status.remoteAnalysis ? "" : "muted"}`}>{status.remoteAnalysis ? <CheckCircle2 size={15} /> : <Radio size={15} />} {status.remoteAnalysis ? "Activo" : "Opcional"}</span></section>
      </div>}
      <div className="settings-note"><Shield size={18} /><div><strong>Las licencias siempre deben verificarse en la fuente.</strong><p>TAC Search estima calidad y presencia de marcas, pero no concede derechos de uso sobre las fotografías.</p></div></div>
    </div>
  );
}
