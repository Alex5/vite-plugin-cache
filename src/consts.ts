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
};

export const DEFAULT_OPTS: VitePluginCacheConfig = {
  workboxVersion: "7.1.0",
  apiUrlPattern: API_URL_PATTERN,
};
