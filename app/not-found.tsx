import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return <div className="error-page"><Image src="/assets/tac-logo.png" alt="TAC" width={2828} height={2828} /><span>Error 404</span><h1>Esta jugada no existe</h1><p>La página que buscás quedó fuera de juego.</p><Link href="/">Volver al inicio</Link></div>;
}
