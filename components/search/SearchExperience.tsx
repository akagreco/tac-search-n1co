"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Database, Images, Radio, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import type { ImageResult, SearchFilters, SearchStreamEvent, SearchSummary } from "@/types";
import { defaultFilters } from "@/types";
import { filterAndSortResults } from "@/lib/utils/image";
import { useAppStore } from "@/lib/storage/app-store";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { LoadingResults } from "./LoadingResults";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { ImagePreviewModal } from "@/components/image/ImagePreviewModal";

const progressMessages = ["Buscando en Internet y archivos...", "Comparando coincidencias...", "Analizando calidad y resolución...", "Agrupando duplicados...", "Ordenando las mejores fotos..."];

export function SearchExperience({ query }: { query: string }) {
  const router = useRouter();
  const { isSaved, toggleSaved, addRecent } = useAppStore();
  const [results, setResults] = useState<ImageResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [loading, setLoading] = useState(Boolean(query));
  const [progress, setProgress] = useState(progressMessages[0]);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [providerWarnings, setProviderWarnings] = useState(0);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [mode, setMode] = useState<"live" | "mock" | "hybrid">("live");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    let progressIndex = 0;
    const timer = window.setInterval(() => { progressIndex = Math.min(progressMessages.length - 1, progressIndex + 1); setProgress(progressMessages[progressIndex]); }, 1_100);
    const run = async () => {
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, filters: defaultFilters, page: 1 }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo iniciar la búsqueda");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as SearchStreamEvent;
            if (event.type === "cached") { setResults(event.results); setCacheAge(event.ageSeconds); }
            if (event.type === "provider") { setResults(event.results); setCacheAge(null); }
            if (event.type === "provider-error") setProviderWarnings((count) => count + 1);
            if (event.type === "complete") {
              setResults(event.results); setSummary(event.summary); setMode(event.mode); setLoading(false);
              addRecent(query, event.summary.found);
            }
            if (event.type === "error") setError(event.message);
          }
          if (done) break;
        }
      } catch (reason) {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "La búsqueda falló");
        setLoading(false);
      } finally {
        window.clearInterval(timer);
      }
    };
    run();
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [query, requestKey, addRecent]);

  const visibleResults = useMemo(() => filterAndSortResults(results, filters), [results, filters]);
  const selectedIndex = selectedId ? visibleResults.findIndex((image) => image.id === selectedId) : -1;
  const selectedImage = selectedIndex >= 0 ? visibleResults[selectedIndex] : null;
  const openAt = (index: number) => setSelectedId(visibleResults[index]?.id || null);
  const previous = useCallback(() => {
    if (!visibleResults.length) return;
    const index = selectedId ? visibleResults.findIndex((image) => image.id === selectedId) : 0;
    setSelectedId(visibleResults[(index - 1 + visibleResults.length) % visibleResults.length].id);
  }, [selectedId, visibleResults]);
  const next = useCallback(() => {
    if (!visibleResults.length) return;
    const index = selectedId ? visibleResults.findIndex((image) => image.id === selectedId) : -1;
    setSelectedId(visibleResults[(index + 1) % visibleResults.length].id);
  }, [selectedId, visibleResults]);

  if (!query) return <div className="search-empty page-container"><SearchBar autoFocus /><div><Images size={34} /><h1>¿Qué foto necesitás para el programa?</h1><p>Escribí un jugador, un club, una selección o un acontecimiento futbolístico.</p></div></div>;

  return (
    <div className="search-page">
      <div className="search-header"><div className="page-container search-header-inner"><SearchBar key={query} initialQuery={query} compact /><div className="query-title"><span>Resultados para</span><h1>“{query}”</h1></div></div></div>
      <div className="page-container">
        <FilterBar filters={filters} setFilters={setFilters} total={visibleResults.length} />
        {cacheAge !== null && <div className="cache-banner"><Database size={15} /> Mostrando resultados guardados hace {cacheAge < 60 ? "menos de un minuto" : `${Math.round(cacheAge / 60)} min`} mientras se actualizan.</div>}
        {summary && <div className="search-summary"><span><Images size={16} /><strong>{summary.found}</strong> imágenes encontradas</span><span className="excellent"><Sparkles size={16} /><strong>{summary.excellent}</strong> excelentes</span><span><CheckCircle2 size={16} /><strong>{summary.duplicates}</strong> duplicados agrupados</span><span><ShieldCheck size={16} /><strong>{summary.watermarksFiltered}</strong> posibles marcas señaladas</span><span className="summary-mode"><Radio size={14} />{mode === "mock" ? "Modo demostración" : mode === "hybrid" ? "Resultados híbridos" : "Búsqueda en vivo"}</span></div>}
        {providerWarnings > 0 && results.length > 0 && <div className="provider-warning"><AlertTriangle size={15} /> {providerWarnings} {providerWarnings === 1 ? "fuente no respondió" : "fuentes no respondieron"}; el resto de la búsqueda continuó normalmente.</div>}
        {loading && <LoadingResults message={progress} />}
        {error && <div className="error-state"><AlertTriangle size={28} /><div><strong>No pudimos completar la búsqueda</strong><p>{error}</p></div><button onClick={() => { setLoading(true); setError(""); setSummary(null); setProviderWarnings(0); setCacheAge(null); setResults([]); setProgress(progressMessages[0]); setRequestKey((key) => key + 1); }}><RefreshCw size={16} /> Reintentar</button></div>}
        {visibleResults.length > 0 && <ImageGallery images={visibleResults} onOpen={openAt} isSaved={isSaved} onToggleSaved={toggleSaved} />}
        {!loading && !error && results.length > 0 && visibleResults.length === 0 && <div className="no-filter-results"><Images size={30} /><h2>Ninguna foto pasa estos filtros</h2><p>Probá ampliar calidad, fecha o resolución.</p><button onClick={() => setFilters(defaultFilters)}>Restablecer filtros</button></div>}
        {!loading && !error && results.length === 0 && <div className="no-filter-results"><Images size={30} /><h2>No encontramos imágenes</h2><p>Probá con el nombre completo o agregá el club o la selección.</p></div>}
      </div>
      {selectedImage && <ImagePreviewModal key={selectedImage.id} image={selectedImage} position={selectedIndex} total={visibleResults.length} saved={isSaved(selectedImage.id)} onClose={() => setSelectedId(null)} onPrevious={previous} onNext={next} onToggleSaved={() => toggleSaved(selectedImage)} onSimilar={() => { setSelectedId(null); router.push(`/search?q=${encodeURIComponent(selectedImage.title.split("—")[0].trim())}`); }} />}
    </div>
  );
}
