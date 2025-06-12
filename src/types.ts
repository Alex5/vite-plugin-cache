import { RouteMatchCallback } from "workbox-core/types";
import { type Route } from "workbox-routing";
import { type ExpirationPluginOptions } from "workbox-expiration";
import { STRATEGY_MAP } from "./consts";

type SerializableMatcher = string | RegExp | RouteMatchCallback | Route;

type PluginDefinition = {
  expiration?: ExpirationPluginOptions;
};

type CacheConfig = {
  match: SerializableMatcher;
  strategy: keyof typeof STRATEGY_MAP;
  plugins?: PluginDefinition;
  networkTimeoutSeconds?: number;
};

export type Config = Record<string, CacheConfig>

export type VitePluginCacheConfig = {
  config?: Config | ((defaultPluginConfig: Config) => Config);
  apiUrlPattern?: RegExp;
  workboxVersion?: string;
};
