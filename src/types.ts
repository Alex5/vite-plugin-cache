import type { RouteMatchCallback } from "workbox-core";
import type { Route } from "workbox-routing";
import type { ExpirationPluginOptions } from "workbox-expiration";
import type {
  PageCacheOptions,
  ImageCacheOptions,
  StaticResourceOptions,
  GoogleFontCacheOptions,
  OfflineFallbackOptions,
} from "workbox-recipes";

import { STRATEGY_MAP } from "./consts";

type PluginDefinition = {
  expiration?: ExpirationPluginOptions;
};

type CacheConfig = {
  match: string | RegExp | RouteMatchCallback | Route;
  strategy: keyof typeof STRATEGY_MAP;
  plugins?: PluginDefinition;
  networkTimeoutSeconds?: number;
};

export type Config = { "swr-api-cache": CacheConfig } & CustomConfig;

type CustomConfig = Record<string, CacheConfig>;

export type VitePluginCacheConfig = {
  config?: Config | ((defaultPluginConfig: Config) => Config);
  recipies?: {
    pageCache?: PageCacheOptions | null;
    imageCache?: ImageCacheOptions | null;
    staticResourceCache?: StaticResourceOptions | null;
    googleFontsCache?: GoogleFontCacheOptions | null;
    offlineFallback?: OfflineFallbackOptions | null;
  };
  workboxVersion?: string;
};
