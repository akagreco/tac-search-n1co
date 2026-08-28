"use client";

import { useEffect, useRef, useState } from "react";
import type { ImageResult } from "@/types";
import { ImageCard } from "./ImageCard";

type Props = {
  images: ImageResult[];
  onOpen: (index: number) => void;
  isSaved: (id: string) => boolean;
  onToggleSaved: (image: ImageResult) => void;
};

export function ImageGallery({ images, onOpen, isSaved, onToggleSaved }: Props) {
  const [visibleCount, setVisibleCount] = useState(24);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisibleCount((count) => Math.min(images.length, count + 20));
    }, { rootMargin: "600px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [images.length]);
  return (
    <>
      <div className="image-gallery">{images.slice(0, visibleCount).map((image, index) => <ImageCard key={image.id} image={image} saved={isSaved(image.id)} onOpen={() => onOpen(index)} onToggleSaved={() => onToggleSaved(image)} />)}</div>
      <div ref={loadMoreRef} className="load-more-sentinel" aria-hidden="true" />
    </>
  );
}
