"use client";

import { FormEvent, useState } from "react";
import { BookmarkPlus, FolderHeart, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/storage/app-store";

export function CollectionManager() {
  const { hydrated, saved, collections, createCollection, deleteCollection, toggleInCollection } = useAppStore();
  const [name, setName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const submit = (event: FormEvent) => { event.preventDefault(); createCollection(name); setName(""); };
  const active = collections.find((collection) => collection.id === activeId) || collections[0];
  return (
    <div className="collections-page page-container">
      <header className="page-heading"><div><span className="section-kicker"><FolderHeart size={15} /> Organización rápida</span><h1>Colecciones</h1><p>Agrupá fotos por bloque, torneo, club o programa.</p></div></header>
      <form className="new-collection" onSubmit={submit}><label htmlFor="collection-name">Nueva colección</label><div><input id="collection-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} placeholder="Ej. Programa de hoy" /><button type="submit"><Plus size={17} /> Crear</button></div></form>
      {!hydrated ? <div className="library-skeleton" /> : collections.length === 0 ? <div className="empty-library compact"><span><FolderHeart size={32} /></span><h2>Creá tu primera colección</h2><p>Algunas ideas: Programa de hoy, Argentina, Champions o Mercado de pases.</p></div> : <div className="collections-layout">
        <aside className="collection-list">{collections.map((collection) => <button key={collection.id} className={active?.id === collection.id ? "active" : ""} onClick={() => setActiveId(collection.id)}><span><FolderHeart size={18} /><span><strong>{collection.name}</strong><small>{collection.imageIds.length} imágenes</small></span></span><span className="delete-collection" role="button" tabIndex={0} aria-label={`Eliminar ${collection.name}`} onClick={(event) => { event.stopPropagation(); deleteCollection(collection.id); }}><Trash2 size={15} /></span></button>)}</aside>
        {active && <section className="collection-editor"><div className="collection-editor-head"><div><h2>{active.name}</h2><p>Elegí qué imágenes guardadas forman parte de esta colección.</p></div><span>{active.imageIds.length} seleccionadas</span></div>{saved.length ? <div className="collection-image-list">{saved.map((image) => { const included = active.imageIds.includes(image.id); return <button key={image.id} className={included ? "included" : ""} onClick={() => toggleInCollection(active.id, image.id)}><img src={image.thumbnailUrl} alt="" /><span><strong>{image.title}</strong><small>{image.width} × {image.height} · Score {image.scores.broadcastScore}</small></span><BookmarkPlus size={18} /></button>; })}</div> : <div className="empty-collection">Primero guardá algunas imágenes desde una búsqueda.</div>}</section>}
      </div>}
    </div>
  );
}
