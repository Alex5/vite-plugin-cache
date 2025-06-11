import { Plugin } from "vite";
import path from "path";
import fs from "fs/promises";

interface VitePluginCacheOptions {
  swFileName?: string;
  apiUrlPattern?: RegExp;
}

const defaultOptions: VitePluginCacheOptions = {
  swFileName: "vite-plugin-cache-worker.js",
  apiUrlPattern: /^https:\/\/[^/]+\/api\//,
};

export function vitePluginCache(
  userOptions: VitePluginCacheOptions = {}
): Plugin {
  const options = { ...defaultOptions, ...userOptions };

  let outDir: string;
  let basePath = "/";
  let swDest: string;

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
const { StaleWhileRevalidate, NetworkFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;

registerRoute(
  ({ request }) =>
    ["document", "script", "style", "image", "font"].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: "assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 дней
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) => ${options.apiUrlPattern}.test(url.href) && request.method === "GET",
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 5 * 60,
        maxEntries: 50,
      }),
    ],
  })
);

self.skipWaiting();
self.clients.claim();
`;
      await fs.writeFile(swDest, workboxSwCode, "utf-8");

      console.debug("vite-plugin-cache: API service worker created:", swDest);
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
      .then(() => console.debug('vite-plugin-cache: service worker registered'))
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
