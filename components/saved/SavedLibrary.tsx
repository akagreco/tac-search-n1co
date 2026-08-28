"use client";

import { useCallback, useMemo, useState } from "react";
import { Bookmark, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/storage/app-store";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { ImagePreviewModal } from "@/components/image/ImagePreviewModal";

export function SavedLibrary() {
  const router = useRouter();
  const { hydrated, saved, isSaved, toggleSaved } = useAppStore();
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const images = useMemo(() => saved.filter((image) => `${image.title} ${image.source}`.toLowerCase().includes(filter.toLowerCase())), [saved, filter]);
  const selectedIndex = selectedId ? images.findIndex((image) => image.id === selectedId) : -1;
  const selected = selectedIndex >= 0 ? images[selectedIndex] : null;
  const previous = useCallback(() => { if (images.length) setSelectedId(images[(selectedIndex - 1 + images.length) % images.length].id); }, [images, selectedIndex]);
  const next = useCallback(() => { if (images.length) setSelectedId(images[(selectedIndex + 1) % images.length].id); }, [images, selectedIndex]);
  return (
    <div className="library-page page-container">
      <header className="page-heading"><div><span className="section-kicker"><Bookmark size={15} /> Biblioteca del operador</span><h1>Guardadas</h1><p>Fotos seleccionadas para usar o revisar durante el programa.</p></div><div className="heading-count"><strong>{saved.length}</strong><span>imágenes</span></div></header>
      {hydrated && saved.length > 0 && <div className="library-search"><Search size={17} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filtrar guardadas..." aria-label="Filtrar imágenes guardadas" /></div>}
      {!hydrated ? <div className="library-skeleton" /> : images.length ? <ImageGallery images={images} onOpen={(index) => setSelectedId(images[index].id)} isSaved={isSaved} onToggleSaved={toggleSaved} /> : <div className="empty-library"><span><Bookmark size={34} /></span><h2>{saved.length ? "No hay coincidencias" : "Todavía no guardaste fotos"}</h2><p>{saved.length ? "Probá con otro término." : "En una búsqueda, presioná F o tocá el marcador de una imagen."}</p><button onClick={() => router.push("/search")}><Search size={17} /> Buscar imágenes</button></div>}
      {selected && <ImagePreviewModal key={selected.id} image={selected} position={selectedIndex} total={images.length} saved={isSaved(selected.id)} onClose={() => setSelectedId(null)} onPrevious={previous} onNext={next} onToggleSaved={() => toggleSaved(selected)} onSimilar={() => router.push(`/search?q=${encodeURIComponent(selected.title.split("—")[0].trim())}`)} />}
    </div>
  );
}
