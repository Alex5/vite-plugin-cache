import { Plugin } from "vite";
import { generateSW } from "workbox-build";
import path from "path";

interface VitePluginCacheOptions {
  swFileName?: string;
  globPatterns?: string[];
  navigateFallback?: string;
  apiUrlPatter: RegExp;
}

const defaultOptions: VitePluginCacheOptions = {
  swFileName: "vite-cache-service-worker.js",
  globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff2}"],
  navigateFallback: "/index.html",
  apiUrlPatter: /^https:\/\/[^/]+\/api\//,
};

export function vitePluginCache(
  userOptions: VitePluginCacheOptions = {
    apiUrlPatter: defaultOptions.apiUrlPatter,
  }
): Plugin {
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
      const { count, size, warnings } = await generateSW({
        swDest,
        globDirectory: outDir,
        globPatterns: options.globPatterns,
        runtimeCaching: [
          {
            urlPattern: options.apiUrlPatter,
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
          },
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
        ],
        navigateFallback: options.navigateFallback,
        skipWaiting: true,
        clientsClaim: true,
      });

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
