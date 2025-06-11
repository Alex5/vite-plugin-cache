import { build } from "esbuild";
import { Plugin } from "vite";
import path from "path";

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
      await build({
        entryPoints: [path.resolve(__dirname, "sw.ts")],
        bundle: true,
        outfile: swDest,
        format: "esm",
        target: "es2020",
        minify: true,
      });

      console.debug("vite-plugin-cache: service worker bundled at", swDest);
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
