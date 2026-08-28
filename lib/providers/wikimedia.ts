import type { RawImageResult } from "@/types";
import { stripHtml } from "@/lib/utils/text";
import { fetchJson, type SearchProvider } from "./provider";

type Meta = { value?: string };
type WikimediaPage = {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    url?: string;
    thumburl?: string;
    descriptionurl?: string;
    width?: number;
    height?: number;
    size?: number;
    mime?: string;
    timestamp?: string;
    user?: string;
    extmetadata?: Record<string, Meta>;
  }>;
};

export const wikimediaProvider: SearchProvider = {
  id: "wikimedia",
  name: "Wikimedia Commons",
  requiresKey: false,
  coverage: "archive",
  isConfigured: () => true,
  async search(query, { page, signal }) {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      generator: "search",
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: "25",
      gsroffset: String((page - 1) * 25),
      prop: "imageinfo",
      iiprop: "url|size|mime|timestamp|user|extmetadata",
      iiurlwidth: "1200",
      iiextmetadatalanguage: "es",
      iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|ImageDescription",
      origin: "*",
    });
    const data = await fetchJson<{ query?: { pages?: WikimediaPage[] } }>(
      `https://commons.wikimedia.org/w/api.php?${params}`,
      { signal },
    );
    return (data.query?.pages || []).flatMap<RawImageResult>((pageResult, index) => {
      const info = pageResult.imageinfo?.[0];
      if (!info?.url || !info.thumburl || !info.descriptionurl) return [];
      const metadata = info.extmetadata || {};
      return [{
        id: `wikimedia:${pageResult.pageid}`,
        providerId: "wikimedia",
        sourceId: String(pageResult.pageid),
        title: pageResult.title.replace(/^File:/, "").replace(/_/g, " "),
        description: stripHtml(metadata.ImageDescription?.value),
        thumbnailUrl: info.thumburl,
        originalUrl: info.url,
        sourceUrl: info.descriptionurl,
        width: info.width || 0,
        height: info.height || 0,
        bytes: info.size,
        format: info.mime?.split("/")[1],
        author: stripHtml(metadata.Artist?.value) || info.user,
        license: stripHtml(metadata.LicenseShortName?.value) || "Licencia no verificada",
        licenseUrl: metadata.LicenseUrl?.value,
        publishedAt: metadata.DateTimeOriginal?.value || info.timestamp,
        domain: "commons.wikimedia.org",
        source: "Wikimedia Commons",
        providerRank: 100 - index,
      }];
    });
  },
};
