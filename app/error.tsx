"use client";

import Image from "next/image";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="error-page"><Image src="/assets/tac-logo.png" alt="TAC" width={2828} height={2828} /><span>Error inesperado</span><h1>La búsqueda se interrumpió</h1><p>El resto del sistema sigue protegido. Podés volver a intentarlo.</p><button onClick={reset}>Reintentar</button></div>;
}
