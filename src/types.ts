import { STRATEGY_MAP } from "./consts";

import { RouteMatchCallback, WorkboxPlugin } from "./workbox-core-types";

type CacheQueryOptions = {
  ignoreSearch?: boolean;
  ignoreMethod?: boolean;
  ignoreVary?: boolean;
  cacheName?: string;
};

type PluginDefinition = {
  expiration?: {
    maxEntries?: number;
    maxAgeSeconds?: number;
    matchOptions?: CacheQueryOptions;
    purgeOnQuotaError?: boolean;
  };
};

type CacheConfig = {
  match: RouteMatchCallback;
  strategy: keyof typeof STRATEGY_MAP;
  plugins?: PluginDefinition;
  networkTimeoutSeconds?: number;
};

export type Config = { "swr-api-cache": CacheConfig } & CustomConfig;

type CustomConfig = Record<string, CacheConfig>;

export type VitePluginCacheConfig = {
  config?: Config | ((defaultPluginConfig: Config) => Config);
  recipies?: {
    pageCache?: {
      cacheName?: string;
      matchCallback?: RouteMatchCallback;
      networkTimeoutSeconds?: number;
      plugins?: Array<WorkboxPlugin>;
      warmCache?: Array<string>;
    } | null;
    imageCache?: {
      cacheName?: string;
      matchCallback?: RouteMatchCallback;
      maxAgeSeconds?: number;
      maxEntries?: number;
      plugins?: Array<WorkboxPlugin>;
      warmCache?: Array<string>;
    } | null;
    staticResourceCache?: {
      cacheName?: string;
      matchCallback?: RouteMatchCallback;
      plugins?: Array<WorkboxPlugin>;
      warmCache?: Array<string>;
    } | null;
    googleFontsCache?: {
      cachePrefix?: string;
      maxAgeSeconds?: number;
      maxEntries?: number;
    } | null;
    offlineFallback?: {
      pageFallback?: string;
      imageFallback?: string;
      fontFallback?: string;
    } | null;
  };
  workboxVersion?: string;
};
