import { VitePluginCacheConfig, Config } from "./types";

export const STRATEGY_MAP = {
  "stale-while-revalidate": "StaleWhileRevalidate",
  "network-first": "NetworkFirst",
  "cache-first": "CacheFirst",
  "network-only": "NetworkOnly",
  "cache-only": "CacheOnly",
};

export const PLUGINS_MAP: Record<string, string> = {
  expiration: "ExpirationPlugin",
};

export const SW_FILENAME = "vite-plugin-cache-service-worker.js";

export const DEFAULT_CONFIG: Config = {
  "swr-api-cache": {
    match: ({ url, request }) =>
      new RegExp(/^https:\/\/[^/]+\/api\//).test(url.href) &&
      request.method === "GET",
    strategy: "stale-while-revalidate",
    plugins: {
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60, // 1 minute
      },
    },
  },
};

export const DEFAULT_OPTS: VitePluginCacheConfig = {
  workboxVersion: "7.1.0",
  recipies: {
    pageCache: null,
    googleFontsCache: null,
    imageCache: null,
    staticResourceCache: null,
  },
  config: DEFAULT_CONFIG,
};
