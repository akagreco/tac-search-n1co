"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { ChevronDown, ListFilter, Radio, SlidersHorizontal } from "lucide-react";
import type { SearchFilters } from "@/types";

type Props = {
  filters: SearchFilters;
  setFilters: Dispatch<SetStateAction<SearchFilters>>;
  total: number;
};

const contextChips: Array<{ label: string; type?: SearchFilters["type"]; date?: SearchFilters["date"] }> = [
  { label: "Todo", type: "all", date: "all" },
  { label: "Últimas", type: "all", date: "month" },
  { label: "Partido", type: "match" },
  { label: "Celebración", type: "celebration" },
  { label: "Entrenamiento", type: "training" },
  { label: "Conferencia", type: "conference" },
  { label: "Club", type: "club" },
  { label: "Selección", type: "national-team" },
];

export function FilterBar({ filters, setFilters, total }: Props) {
  const [expanded, setExpanded] = useState(false);
  const update = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => setFilters((current) => ({ ...current, [key]: value }));
  return (
    <div className="filters-wrap">
      <div className="context-row">
        <div className="context-chips" role="group" aria-label="Contexto de la fotografía">
          {contextChips.map((chip) => {
            const active = chip.label === "Todo"
              ? filters.type === "all" && filters.date === "all"
              : chip.label === "Últimas" ? filters.date === "month" : filters.type === chip.type;
            return <button key={chip.label} className={active ? "context-chip active" : "context-chip"} onClick={() => setFilters((current) => ({ ...current, ...(chip.type ? { type: chip.type } : {}), ...(chip.date ? { date: chip.date } : {}) }))}>{chip.label}</button>;
          })}
        </div>
        <button className="filter-toggle" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}><SlidersHorizontal size={16} /> Filtros <ChevronDown size={15} className={expanded ? "rotated" : ""} /></button>
      </div>
      <div className={expanded ? "filter-panel expanded" : "filter-panel"}>
        <label><span>Calidad</span><select value={filters.quality} onChange={(event) => update("quality", event.target.value as SearchFilters["quality"])}><option value="all">Todas</option><option value="high">Alta</option><option value="very-high">Muy alta</option></select></label>
        <label><span>Resolución</span><select value={filters.resolution} onChange={(event) => update("resolution", event.target.value as SearchFilters["resolution"])}><option value="all">Todas</option><option value="full-hd">Full HD+</option><option value="2k">2K+</option><option value="4k">4K+</option><option value="6k">6K / 8K</option></select></label>
        <label><span>Orientación</span><select value={filters.orientation} onChange={(event) => update("orientation", event.target.value as SearchFilters["orientation"])}><option value="all">Todas</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option><option value="square">Cuadrada</option></select></label>
        <label><span>Marca de agua</span><select value={filters.watermark} onChange={(event) => update("watermark", event.target.value as SearchFilters["watermark"])}><option value="prefer-clear">Preferir sin marca</option><option value="all">Mostrar todas</option><option value="hide-possible">Ocultar posibles</option></select></label>
        <label><span>Fecha</span><select value={filters.date} onChange={(event) => update("date", event.target.value as SearchFilters["date"])}><option value="all">Cualquier fecha</option><option value="day">Últimas 24 h</option><option value="week">Última semana</option><option value="month">Último mes</option><option value="year">Último año</option></select></label>
        <label><span>Ordenar</span><select value={filters.sort} onChange={(event) => update("sort", event.target.value as SearchFilters["sort"])}><option value="broadcast">Mejor para el programa</option><option value="quality">Mayor calidad</option><option value="resolution">Mayor resolución</option><option value="recent">Más recientes</option><option value="relevant">Más relevantes</option><option value="watermark">Menos watermark</option></select></label>
      </div>
      <div className="results-toolbar">
        <span><ListFilter size={15} /> {total.toLocaleString("es-AR")} imágenes visibles</span>
        <span className="mode-label"><Radio size={14} /> Modo Programa activo</span>
        <label className="sort-inline">Ordenar: <select value={filters.sort} onChange={(event) => update("sort", event.target.value as SearchFilters["sort"])}><option value="broadcast">Mejor para el programa</option><option value="quality">Mayor calidad</option><option value="resolution">Mayor resolución</option><option value="recent">Más recientes</option><option value="relevant">Más relevantes</option><option value="watermark">Menos watermark</option></select></label>
      </div>
    </div>
  );
}
