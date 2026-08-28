const suffixes = [
  "football match photo",
  "latest football",
  "celebration",
  "training",
  "press conference",
  "official photo",
];

export function expandFootballQuery(query: string) {
  const clean = query.trim().replace(/\s+/g, " ");
  return [clean, ...suffixes.map((suffix) => `${clean} ${suffix}`)];
}

export function queryForProvider(query: string, providerIndex: number) {
  const clean = query.trim().replace(/\s+/g, " ");
  if (providerIndex < 2 || /football|soccer|partido|club/i.test(clean)) return clean;
  return `${clean} football`;
}

export function dynamicContextChips(query: string) {
  return ["Todo", "Últimas", "Partido", "Celebración", "Entrenamiento", "Conferencia", "Club", "Selección"].map(
    (label, index) => ({ label, query: index === 0 ? query : `${query} ${label.toLowerCase()}` }),
  );
}
