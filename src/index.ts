import { Plugin } from "vite";
import { generateSW, RuntimeCaching } from "workbox-build";
import path from "path";
import fs from "fs/promises";

interface VitePluginCacheOptions {
  swFileName?: string;
  globPatterns?: string[];
  navigateFallback?: string;
  apiUrlPattern?: RegExp;
  apiProxy?: {
    prefix: string;
    target: string;
  };
}

const defaultOptions: VitePluginCacheOptions = {
  swFileName: "vite-cache-service-worker.js",
  globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff2}"],
  navigateFallback: "/index.html",
  apiUrlPattern: /^https:\/\/[^/]+\/api\//,
};

export function vitePluginCache(userOptions: VitePluginCacheOptions): Plugin {
  const options = { ...defaultOptions, ...userOptions };

  let outDir: string;
  let swDest: string;
  let basePath = "/";

  return {
    name: "vite-plugin-cache",

    apply: "build",

    configResolved(config) {
      outDir = config.build.outDir;
      swDest = path.resolve(outDir, options.swFileName!);
      basePath = config.base || "/";
      if (!basePath.endsWith("/")) basePath += "/";
    },

    async closeBundle() {
      const proxyHandler = options.apiProxy
        ? `
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

registerRoute(
  ({ url }) => url.pathname.startsWith('${options.apiProxy.prefix}'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [{
      requestWillFetch: async ({ request }) => {
        const originalUrl = new URL(request.url);
        const proxyUrl = '${options.apiProxy.target}' + originalUrl.pathname.slice('${options.apiProxy.prefix}'.length);
        return new Request(proxyUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          mode: request.mode,
          credentials: request.credentials,
          cache: request.cache,
          redirect: request.redirect,
          referrer: request.referrer,
          integrity: request.integrity
        });
      }
    }]
  })
);
`
        : "";

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

      if (options.apiUrlPattern) {
        runtimeCaching.push({
          urlPattern: options.apiUrlPattern,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 10 * 60,
            },
            cacheableResponse: {
              statuses: [0, 200, 201],
            },
          },
        });
      }

      const { count, size, warnings } = await generateSW({
        swDest,
        globDirectory: outDir,
        globPatterns: options.globPatterns,
        runtimeCaching,
        navigateFallback: options.navigateFallback,
        skipWaiting: true,
        clientsClaim: true,
      });

      const swCode = await fs.readFile(swDest, "utf-8");
      const patched = swCode + "\n\n" + proxyHandler;
      await fs.writeFile(swDest, patched, "utf-8");

      console.log(
        "📦 Cached files:",
        count,
        "Size:",
        size,
        "Warnings:",
        warnings
      );
    },

    transformIndexHtml: {
      enforce: "post",
      transform(html) {
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
      .then(() => console.log('Service Worker registered'))
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
