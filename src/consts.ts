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
