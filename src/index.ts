import { Plugin } from "vite";
import { generateSW, RuntimeCaching } from "workbox-build";
import path from "path";
import fs from "fs/promises";

interface VitePluginCacheOptions {
  swFileName?: string;
  apiSwFileName?: string;
  globPatterns?: string[];
  apiUrlPattern?: RegExp;
}

const defaultOptions: VitePluginCacheOptions = {
  swFileName: "vite-plugin-cache-assets-worker.js",
  apiSwFileName: "vite-plugin-cache-api-worker.js",
  globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff2}"],
  apiUrlPattern: /^https:\/\/[^/]+\/api\//,
};

export function vitePluginCache(userOptions: VitePluginCacheOptions): Plugin {
  const options = { ...defaultOptions, ...userOptions };

  let outDir: string;
  let basePath = "/";
  let swDest: string;
  let apiSwDest: string;

  return {
    name: "vite-plugin-cache",
    apply: "build",

    configResolved(config) {
      outDir = config.build.outDir;
      basePath = config.base || "/";
      if (!basePath.endsWith("/")) basePath += "/";
      swDest = path.resolve(outDir, options.swFileName!);
      apiSwDest = path.resolve(outDir, options.apiSwFileName!);
    },

    async closeBundle() {
      const runtimeCaching: RuntimeCaching[] = [
        {
          urlPattern: /.*/,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "runtime-cache",
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 7 * 24 * 60 * 60,
            },
          },
        },
      ];

      const { count, size, warnings } = await generateSW({
        swDest,
        globDirectory: outDir,
        globPatterns: options.globPatterns,
        runtimeCaching,
        skipWaiting: true,
        clientsClaim: true,
      });

      console.log(
        "📦 Workbox cached files:",
        count,
        "Size:",
        size,
        "Warnings:",
        warnings
      );

      // 2. Создаём кастомный SW для API
      const apiSwCode = `
// --- Auto-generated API cache worker ---
const CACHE_NAME = "api-cache-v1";

const API_REGEX = ${options.apiUrlPattern};

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method === "GET" && API_REGEX.test(request.url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || Response.error());

  return cached || fetchPromise;
}
`;
      await fs.writeFile(apiSwDest, apiSwCode, "utf-8");

      console.log("🛠 API service worker created:", apiSwDest);
    },

    transformIndexHtml: {
      order: "post",
      handler(html) {
        return {
          html,
          tags: [
            {
              tag: "script",
              attrs: {},
              children: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('${basePath}${options.swFileName}')
      .then(() => console.log('Static SW registered'))
      .catch(console.error);

    navigator.serviceWorker.register('${basePath}${options.apiSwFileName}')
      .then(() => console.log('API SW registered'))
      .catch(console.error);
  });
}
              `,
              injectTo: "head",
            },
          ],
        };
      },
    },
  };
}
