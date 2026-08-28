import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { AppStoreProvider } from "@/lib/storage/app-store";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TAC Search", template: "%s · TAC Search" },
  description: "TAC Search — Encontrá la mejor foto para poner al aire.",
  applicationName: "TAC Search",
  robots: { index: false, follow: false },
  icons: { icon: "/assets/tac-logo.png", apple: "/assets/tac-logo.png" },
};

export const viewport: Viewport = { themeColor: "#05090C", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body><AppStoreProvider><AppShell>{children}</AppShell></AppStoreProvider></body>
    </html>
  );
}
