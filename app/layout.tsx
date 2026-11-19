import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";

import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CEPK Absence",
    template: "%s · CEPK Absence",
  },
  description:
    "Gestão de faltas, folgas e avisos do Colégio Kennedy — CEPK Absence.",
  applicationName: "CEPK Absence",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "CEPK Absence",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d2417",
};

const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem("wa-theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  } catch (error) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
