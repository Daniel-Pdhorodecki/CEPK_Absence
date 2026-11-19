import type { MetadataRoute } from "next";

import { INSTITUTION_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CEPK Absence",
    short_name: "CEPK",
    description: `Gestão de faltas, folgas e avisos do ${INSTITUTION_NAME}.`,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "pt-BR",
    dir: "ltr",
    background_color: "#070a08",
    theme_color: "#0d2417",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Solicitar falta",
        short_name: "Solicitar",
        description: "Abrir o calendário para pedir uma falta",
        url: "/app/solicitar",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Minhas faltas",
        short_name: "Faltas",
        description: "Acompanhar pedidos e status",
        url: "/app/faltas",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Avisos",
        short_name: "Avisos",
        description: "Ler comunicados da administração",
        url: "/app/avisos",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
