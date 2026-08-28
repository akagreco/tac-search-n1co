import type { Collection, RecentSearch, SavedImage } from "@/types";

/** Contrato compartido por la persistencia local actual y una futura implementación PostgreSQL. */
export interface UserLibraryRepository {
  listSaved(userId: string): Promise<SavedImage[]>;
  saveImage(userId: string, image: SavedImage): Promise<void>;
  removeSaved(userId: string, imageId: string): Promise<void>;
  listCollections(userId: string): Promise<Collection[]>;
  upsertCollection(userId: string, collection: Collection): Promise<void>;
  listRecentSearches(userId: string): Promise<RecentSearch[]>;
  addRecentSearch(userId: string, search: RecentSearch): Promise<void>;
}
