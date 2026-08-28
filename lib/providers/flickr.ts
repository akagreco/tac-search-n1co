import type { RawImageResult } from "@/types";
import { stripHtml } from "@/lib/utils/text";
import { fetchJson, type SearchProvider } from "./provider";

export type FlickrPhoto = {
  id: string;
  owner: string;
  title?: string;
  description?: { _content?: string };
  license?: string;
  dateupload?: string;
  datetaken?: string;
  ownername?: string;
  tags?: string;
  url_c?: string;
  width_c?: string | number;
  height_c?: string | number;
  url_l?: string;
  width_l?: string | number;
  height_l?: string | number;
  url_o?: string;
  width_o?: string | number;
  height_o?: string | number;
};

function numberValue(value: string | number | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapFlickrImages(images: FlickrPhoto[], query: string): RawImageResult[] {
  return images.flatMap((image, index) => {
    const original = image.url_o || image.url_l || image.url_c;
    const thumbnail = image.url_c || image.url_l || image.url_o;
    if (!original || !thumbnail) return [];
    const size = image.url_o
      ? { width: numberValue(image.width_o), height: numberValue(image.height_o) }
      : image.url_l
        ? { width: numberValue(image.width_l), height: numberValue(image.height_l) }
        : { width: numberValue(image.width_c), height: numberValue(image.height_c) };
    return [{
      id: `flickr:${image.id}`,
      providerId: "flickr" as const,
      sourceId: image.id,
      title: image.title || `${query} — Flickr`,
      description: stripHtml(image.description?._content),
      thumbnailUrl: thumbnail,
      originalUrl: original,
      sourceUrl: `https://www.flickr.com/photos/${image.owner}/${image.id}`,
      width: size.width,
      height: size.height,
      author: image.ownername,
      license: image.license ? `Licencia Flickr ${image.license} — verificar en la fuente` : "Licencia no verificada",
      publishedAt: image.datetaken || (image.dateupload ? new Date(Number(image.dateupload) * 1000).toISOString() : undefined),
      domain: "flickr.com",
      source: "Flickr",
      tags: image.tags?.split(" ").filter(Boolean).slice(0, 16),
      providerRank: 100 - index,
    }];
  });
}

export const flickrProvider: SearchProvider = {
  id: "flickr",
  name: "Flickr",
  requiresKey: true,
  keyEnv: "FLICKR_API_KEY",
  coverage: "archive",
  isConfigured: () => Boolean(process.env.FLICKR_API_KEY),
  async search(query, { page, signal, filters }) {
    const key = process.env.FLICKR_API_KEY;
    if (!key) return [];
    const params = new URLSearchParams({
      method: "flickr.photos.search",
      api_key: key,
      format: "json",
      nojsoncallback: "1",
      text: query,
      sort: filters.date === "all" ? "relevance" : "date-posted-desc",
      safe_search: "1",
      media: "photos",
      content_types: "0",
      page: String(page),
      per_page: "30",
      extras: "description,license,date_upload,date_taken,owner_name,tags,o_dims,url_c,url_l,url_o",
    });
    const data = await fetchJson<{ photos?: { photo?: FlickrPhoto[] } }>(`https://www.flickr.com/services/rest/?${params}`, { signal });
    return mapFlickrImages(data.photos?.photo || [], query);
  },
};
