import { Config, VitePluginCacheConfig } from "./types";
import {
  DEFAULT_CONFIG,
  PLUGINS_MAP,
  STRATEGY_MAP,
  SW_FILENAME,
} from "./consts";

import { Project, ScriptKind } from "ts-morph";

const project = new Project();

const file = project.createSourceFile(`dist/${SW_FILENAME}`, "", {
  overwrite: true,
  scriptKind: ScriptKind.JS,
});

export async function generateSWCode(
  opts: Omit<VitePluginCacheConfig, "config"> & { config?: Config }
) {
  const strategiesUsed = new Set<string>();
  const pluginsUsed = new Set<string>();

  const { apiUrlPattern, config, workboxVersion } = opts;

  for (const entry of Object.values(config ?? {})) {
    strategiesUsed.add(STRATEGY_MAP[entry.strategy]);

    if (entry.plugins) {
      Object.keys(entry.plugins ?? {}).forEach((key) => {
        const className = PLUGINS_MAP[key];

        if (className) pluginsUsed.add(className);
      });
    }
  }

  file.addStatements([
    `importScripts("https://storage.googleapis.com/workbox-cdn/releases/${workboxVersion}/workbox-sw.js");`,
    ``,
    `const { registerRoute } = workbox.routing;`,
    `const { ${Array.from(strategiesUsed.values()).join(
      ", "
    )} } = workbox.strategies;`,
    pluginsUsed.size
      ? `const { ${Array.from(pluginsUsed.values()).join(
          ", "
        )} } = workbox.expiration;`
      : ``,
    ``,
    `const API_URL_PATTERN = ${apiUrlPattern};`,
    ``,
  ]);

  Object.entries(config ?? {}).forEach(([cacheName, entry]) => {
    const { match, strategy, plugins = [], ...rest } = entry;

    const strategyClass = STRATEGY_MAP[strategy];

    const pluginInstances = Object.entries(plugins)
      ?.map(([pluginKey, options]) => {
        const className = PLUGINS_MAP[pluginKey];

        return `new ${className}(${JSON.stringify(options, null, 2)})`;
      })
      .join(",\n");

    const optionsLines = [
      `cacheName: "${cacheName}"`,
      ...Object.entries(rest).map(
        ([key, val]) => `${key}: ${JSON.stringify(val)}`
      ),
      ...(pluginInstances
        ? [`plugins: [\n      ${pluginInstances}\n    ]`]
        : []),
    ];

    file.addStatements([
      `registerRoute(`,
      `  ${match},`,
      `  new ${strategyClass}({`,
      `    ${optionsLines.join(",\n    ")}`,
      `  })`,
      `);`,
      ``,
    ]);
  });

  await file.save();
}
