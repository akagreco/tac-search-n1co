import { Suspense } from "react";
import { SearchExperience } from "@/components/search/SearchExperience";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = (params.q || "").trim().slice(0, 100);
  return <Suspense fallback={<div className="page-container page-loading">Preparando TAC Search…</div>}><SearchExperience key={query} query={query} /></Suspense>;
}
