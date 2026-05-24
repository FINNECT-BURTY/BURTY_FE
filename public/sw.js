/**
 * Burty Service Worker
 *
 * 전략:
 * - HTML (navigate 요청): network-only. HTML은 절대 캐시하지 않는다.
 *   → 새 배포가 즉시 반영된다. 오프라인 시에만 안내 응답.
 * - `/_next/static/*`: hash 포함 immutable → cache-first.
 * - `/icons/`, `/fonts/` 등 정적 public 자산: stale-while-revalidate.
 * - 그 외 (API 등): 그대로 통과 (SW가 건드리지 않음).
 *
 * 변경 시 반드시 `CACHE_VERSION`을 올린다. activate에서 옛 캐시를 삭제한다.
 */

const CACHE_VERSION = "v3";
const CACHE_NAME = `burty-pwa-${CACHE_VERSION}`;

const STATIC_ASSET_PREFIXES = ["/_next/static/", "/icons/", "/fonts/"];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheableStaticAsset(pathname) {
  return STATIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // HTML 응답은 항상 네트워크에서. 캐시하지 않는다.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            "<h1>오프라인입니다</h1><p>네트워크 연결을 확인해 주세요.</p>",
            {
              headers: { "Content-Type": "text/html; charset=utf-8" },
              status: 503,
            },
          ),
      ),
    );
    return;
  }

  if (!isCacheableStaticAsset(requestUrl.pathname)) {
    return;
  }

  // /_next/static/*: hash 포함 immutable → cache-first.
  if (requestUrl.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      }),
    );
    return;
  }

  // /icons/, /fonts/ 등: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    }),
  );
});
