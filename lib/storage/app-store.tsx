"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Collection, ImageResult, RecentSearch, SavedImage } from "@/types";

type AppStore = {
  hydrated: boolean;
  saved: SavedImage[];
  recent: RecentSearch[];
  collections: Collection[];
  isSaved: (imageId: string) => boolean;
  toggleSaved: (image: ImageResult) => void;
  addRecent: (query: string, resultCount: number) => void;
  createCollection: (name: string) => void;
  deleteCollection: (id: string) => void;
  toggleInCollection: (collectionId: string, imageId: string) => void;
};

const StoreContext = createContext<AppStore | null>(null);
const keys = { saved: "tac-search:saved", recent: "tac-search:recent", collections: "tac-search:collections" };

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState<SavedImage[]>([]);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSaved(readStorage(keys.saved, []));
      setRecent(readStorage(keys.recent, []));
      setCollections(readStorage(keys.collections, []));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem(keys.saved, JSON.stringify(saved)); }, [saved, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.recent, JSON.stringify(recent)); }, [recent, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(keys.collections, JSON.stringify(collections)); }, [collections, hydrated]);

  const isSaved = useCallback((imageId: string) => saved.some((image) => image.id === imageId), [saved]);
  const toggleSaved = useCallback((image: ImageResult) => {
    setSaved((current) => current.some((entry) => entry.id === image.id)
      ? current.filter((entry) => entry.id !== image.id)
      : [{ ...image, savedAt: new Date().toISOString() }, ...current]);
  }, []);
  const addRecent = useCallback((query: string, resultCount: number) => {
    setRecent((current) => [
      { query, resultCount, searchedAt: new Date().toISOString() },
      ...current.filter((entry) => entry.query.toLowerCase() !== query.toLowerCase()),
    ].slice(0, 12));
  }, []);
  const createCollection = useCallback((name: string) => {
    const clean = name.trim().slice(0, 50);
    if (!clean) return;
    setCollections((current) => [{ id: crypto.randomUUID(), name: clean, createdAt: new Date().toISOString(), imageIds: [] }, ...current]);
  }, []);
  const deleteCollection = useCallback((id: string) => {
    setCollections((current) => current.filter((collection) => collection.id !== id));
  }, []);
  const toggleInCollection = useCallback((collectionId: string, imageId: string) => {
    setCollections((current) => current.map((collection) => collection.id !== collectionId ? collection : {
      ...collection,
      imageIds: collection.imageIds.includes(imageId)
        ? collection.imageIds.filter((id) => id !== imageId)
        : [...collection.imageIds, imageId],
    }));
  }, []);

  const value = useMemo(() => ({ hydrated, saved, recent, collections, isSaved, toggleSaved, addRecent, createCollection, deleteCollection, toggleInCollection }),
    [hydrated, saved, recent, collections, isSaved, toggleSaved, addRecent, createCollection, deleteCollection, toggleInCollection]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAppStore debe utilizarse dentro de AppStoreProvider");
  return store;
}
