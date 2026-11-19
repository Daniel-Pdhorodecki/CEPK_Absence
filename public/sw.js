/*
 * Service worker do CEPK Absence.
 *
 * Estratégia:
 *  - Navegação: rede primeiro; se falhar, tela /offline.
 *  - Estáticos (/_next/static, ícones, fontes): cache primeiro.
 *  - APIs, POST e páginas autenticadas (/app, /admin): nunca entram no cache,
 *    para não misturar dados entre sessões no mesmo dispositivo.
 */

const VERSION = "cepk-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PRECACHE_URLS = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => {}),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname === "/apple-touch-icon.png" ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/manifest.webmanifest"
  );
}

function isPrivateRoute(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname === "/app" ||
    url.pathname.startsWith("/app/") ||
    url.pathname === "/admin" ||
    url.pathname.startsWith("/admin/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(STATIC_CACHE);
          const offline = await cache.match("/offline");
          return (
            offline ??
            new Response("Sem conexão.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })(),
    );
    return;
  }

  if (isPrivateRoute(url)) return;

  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response && response.ok && response.type === "basic") {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })(),
    );
  }
});
