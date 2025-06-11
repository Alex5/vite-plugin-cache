import { Plugin } from "vite";
import { generateSW, RuntimeCaching } from "workbox-build";
import path from "path";
import fs from "fs/promises";

interface VitePluginCacheOptions {
  swFileName?: string;
  globPatterns?: string[];
  apiUrlPattern?: RegExp;
}

const defaultOptions: VitePluginCacheOptions = {
  swFileName: "vite-plugin-cache-worker.js",
  globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff2}"],
  apiUrlPattern: /^https:\/\/[^/]+\/api\//,
};

export function vitePluginCache(
  userOptions: VitePluginCacheOptions = {}
): Plugin {
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
    },

    async closeBundle() {
      const workboxSwCode = `
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js"
);

const { registerRoute } = workbox.routing;
const { StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;

registerRoute(
  ({ url }) => ${options.apiUrlPattern}.test(url.href),
  new StaleWhileRevalidate({
    cacheName: "api-cache",
    new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })
  })
);

registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "document" ||
    request.destination === "font" ||
    request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "assets-cache",
  })
);

self.skipWaiting();
self.clients.claim();
`;
      await fs.writeFile(swDest, workboxSwCode, "utf-8");

      console.log("🛠 API service worker created:", swDest);
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
