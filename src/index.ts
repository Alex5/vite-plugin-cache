import path from "path";
import { Plugin } from "vite";
import { generateSWCode } from "./sw";
import { VitePluginCacheConfig } from "./types";
import { SW_FILENAME, API_URL_PATTERN } from "./consts";

const defaultPluginConfig: VitePluginCacheConfig = {
  apiUrlPattern: API_URL_PATTERN,
  config: {
    "assets-cache": {
      match: ({ request }) =>
        ["document", "script", "style", "image", "font"].includes(
          request.destination
        ),
      strategy: "stale-while-revalidate",
      plugins: {
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400, // 1 day
        },
      },
    },
    "api-cache": {
      match: ({ url, request }) =>
        API_URL_PATTERN.test(url.href) && request.method === "GET",
      strategy: "network-first",
      networkTimeoutSeconds: 3,
      plugins: {
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
  },
};

export function vitePluginCache(
  initialPluginConfig: VitePluginCacheConfig = {}
): Plugin {
  const pluginConfig = { ...defaultPluginConfig, ...initialPluginConfig };

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

      swDest = path.resolve(outDir, SW_FILENAME);
    },

    async closeBundle() {
      await generateSWCode(pluginConfig);

      console.debug(
        `✅ [vite-plugin-cache] Service worker generated at: ${swDest}`
      );
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
                    navigator.serviceWorker.register('${basePath}${SW_FILENAME}')
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
