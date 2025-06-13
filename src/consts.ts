import { pageCache } from "workbox-recipes";
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

export const API_URL_PATTERN = /^https:\/\/[^/]+\/api\//;

export const DEFAULT_CONFIG: Config = {
  "swr-api-cache": {
    match: ({ url, request }) =>
      API_URL_PATTERN.test(url.href) && request.method === "GET",
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
  apiUrlPattern: API_URL_PATTERN,
  recipies: {
    pageCache: null,
    googleFontsCache: null,
    imageCache: null,
    offlineFallback: null,
    staticResourceCache: null,
  },
  config: DEFAULT_CONFIG,
};
