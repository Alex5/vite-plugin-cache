import fs from "fs";
import path from "path";
import { Plugin } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VitePluginCacheOptions {
  swFileName?: string;
  apiUrlPattern?: RegExp;
  excludedApiPaths?: string[];
}

const defaultOptions: VitePluginCacheOptions = {
  swFileName: "vite-plugin-cache-worker.js",
  apiUrlPattern: /^https:\/\/[^/]+\/api\//,
  excludedApiPaths: [],
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
      const swTemplatePath = path.resolve(__dirname, "sw.ts");
      const template = fs.readFileSync(swTemplatePath, "utf-8");

      const replaced = template
        .replace("__EXCLUDED_PATHS__", JSON.stringify(options.excludedApiPaths))
        .replace("__API_URL_PATTERN__", options.apiUrlPattern!.toString());

      fs.writeFileSync(swDest, replaced);
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
