"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";

type Props = { initialQuery?: string; compact?: boolean; autoFocus?: boolean };

export function SearchBar({ initialQuery = "", compact = false, autoFocus = false }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const clean = query.trim();
    if (clean.length < 2) { inputRef.current?.focus(); return; }
    router.push(`/search?q=${encodeURIComponent(clean)}`);
  };

  return (
    <form className={compact ? "search-bar compact" : "search-bar"} onSubmit={submit} role="search">
      <Search className="search-icon" aria-hidden="true" />
      <label className="sr-only" htmlFor={compact ? "search-query-compact" : "search-query"}>Buscar jugador, club o selección</label>
      <input
        ref={inputRef}
        id={compact ? "search-query-compact" : "search-query"}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar jugador, club o selección..."
        autoComplete="off"
        autoFocus={autoFocus}
      />
      {query && <button type="button" className="clear-search" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="Limpiar búsqueda"><X size={18} /></button>}
      {!compact && <span className="shortcut-hint">/</span>}
      <button className="search-submit" type="submit"><span>Buscar</span><ArrowRight size={18} /></button>
    </form>
  );
}
