import path from "path";
import { Plugin } from "vite";
import { generateSWCode } from "./sw";
import { VitePluginCacheConfig } from "./types";
import { SW_FILENAME, DEFAULT_OPTS, DEFAULT_CONFIG } from "./consts";

export function vitePluginCache(opts: VitePluginCacheConfig = {}): Plugin {
  const config =
    typeof opts.config === "function"
      ? opts.config(DEFAULT_CONFIG)
      : opts.config;

  const pluginOpts = { ...DEFAULT_OPTS, ...opts, config };

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
      await generateSWCode(pluginOpts);

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
