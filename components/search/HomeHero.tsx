"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Clock3, Radio, Sparkles } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { useAppStore } from "@/lib/storage/app-store";

const examples = ["Lionel Messi", "Franco Mastantuono", "Selección Argentina", "River Plate", "Real Madrid"];

export function HomeHero() {
  const { recent, saved, hydrated } = useAppStore();
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-eyebrow"><Radio size={15} /> Herramienta para producción en vivo</div>
        <div className="hero-logo-wrap"><Image src="/assets/tac-logo.png" alt="Logo oficial de TAC" width={2828} height={2828} priority /></div>
        <h1>TAC <span>Search</span></h1>
        <p className="hero-tagline">Encontrá la mejor foto para poner al aire.</p>
        <p className="hero-copy">TAC busca por vos en Internet, archivos y bancos fotográficos; compara cada resultado y ordena primero las mejores opciones para el programa.</p>
        <div className="hero-search"><SearchBar autoFocus /></div>
        <div className="example-searches" aria-label="Búsquedas de ejemplo">
          <span>Probá con</span>
          {examples.map((example) => <Link key={example} href={`/search?q=${encodeURIComponent(example)}`}>{example}</Link>)}
        </div>
        <div className="hero-promise"><Sparkles size={16} /> Búsqueda web automática y ranking por coincidencia, calidad y limpieza</div>
      </section>

      <section className="home-panels page-container" aria-label="Accesos rápidos">
        <article className="home-panel">
          <div className="panel-title"><span className="panel-icon cyan"><Clock3 size={18} /></span><div><h2>Búsquedas recientes</h2><p>Volvé a encontrar resultados al instante</p></div></div>
          <div className="recent-list">
            {!hydrated ? <div className="skeleton-line" /> : recent.length ? recent.slice(0, 5).map((item) => (
              <Link href={`/search?q=${encodeURIComponent(item.query)}`} key={item.query}><span>{item.query}</span><small>{item.resultCount} resultados</small></Link>
            )) : <p className="empty-inline">Tus búsquedas aparecerán acá.</p>}
          </div>
        </article>
        <article className="home-panel">
          <div className="panel-title"><span className="panel-icon gold"><Bookmark size={18} /></span><div><h2>Guardadas</h2><p>Tu selección para el próximo bloque</p></div></div>
          {hydrated && saved.length ? <div className="saved-strip">{saved.slice(0, 4).map((image) => <img key={image.id} src={image.thumbnailUrl} alt={image.title} />)}</div> : <p className="empty-inline">Guardá una foto con <kbd>F</kbd> para tenerla a mano.</p>}
          <Link href="/saved" className="text-link">Ver guardadas <span>→</span></Link>
        </article>
      </section>
    </div>
  );
}
