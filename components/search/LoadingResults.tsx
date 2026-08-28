import { ScanSearch } from "lucide-react";

export function LoadingResults({ message }: { message: string }) {
  return (
    <div className="loading-results" role="status">
      <div className="scanner"><ScanSearch size={24} /><span /></div>
      <div><strong>{message}</strong><p>Los resultados aparecen a medida que responde cada fuente.</p></div>
    </div>
  );
}
