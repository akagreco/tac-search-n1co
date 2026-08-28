"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, FolderHeart, Home, Search, Settings } from "lucide-react";

const links = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/saved", label: "Guardadas", icon: Bookmark },
  { href: "/collections", label: "Colecciones", icon: FolderHeart },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="TAC Search, inicio">
          <span className="brand-mark"><Image src="/assets/tac-logo.png" alt="Logo oficial de TAC" width={2828} height={2828} priority /></span>
          <span><strong>TAC Search</strong><small>Producción audiovisual</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return <Link key={href} href={href} className={active ? "nav-link active" : "nav-link"}><Icon size={17} />{label}</Link>;
          })}
        </nav>
        <div className="broadcast-pill"><span className="live-dot" /> Modo Programa</div>
      </header>
      <main>{children}</main>
      <nav className="mobile-nav" aria-label="Navegación móvil">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={20} /><span>{label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
