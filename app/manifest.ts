import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TAC Search",
    short_name: "TAC Search",
    description: "Encontrá la mejor foto para poner al aire.",
    start_url: "/",
    display: "standalone",
    background_color: "#212121",
    theme_color: "#212121",
    icons: [
      { src: "/assets/tac-logo.png", sizes: "2828x2828", type: "image/png", purpose: "any" },
    ],
  };
}
