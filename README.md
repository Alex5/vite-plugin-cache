## 🧩 vite-plugin-cache

A Vite plugin that automatically generates a service worker using Workbox based on a declarative config. Ideal for caching static assets and API requests in Vite projects.

### 🔧 Installation

```bash
npm install vite-plugin-cache
```

### 🚀 Usage

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginCache } from "vite-plugin-cache";

export default defineConfig({
  plugins: [vitePluginCache()],
});
```

### ⚙️ Configuration

```ts
// default config
const config = {
  apiUrlPatter: /^https:\/\/example.com\/api\//,
  config: {
    "assets-cache": {
      match: ({ request }) =>
        ["document", "script", "style", "image", "font"].includes(request.destination),
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
        /^https:\/\/example.com\/api\//.test(url.href) && request.method === "GET",
      strategy: "network-first",
      networkTimeoutSeconds: 3,
      plugins: {
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 300, // 5 minutes
        },
      },
    },
  },
};

// full config rewrite
vitePluginCache({
  config: {
    'cdn-cache': {
      match: ({ url }) => url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com'),
      strategy: "cache-first",
      plugins: {
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      }
    }
  }
})

// partial config rewrite
vitePluginCache({
  config: (defaultConfig) => ({
    ...defaultConfig,
    'cdn-cache': {
      match: ({ url }) => url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com'),
      strategy: "cache-first",
      plugins: {
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      }
    }
  })
})
```

### 📦 What This Plugin Does

- Generates vite-plugin-cache-service-worker.js using ts-morph.

- Automatically imports only the strategies and plugins you use.

- Injects serviceWorker.register(...) into your index.html.

### ✅ Supported Strategies

- stale-while-revalidate

- network-first

- cache-first

- network-only

- cache-only

### 🧩 Supported Workbox Plugins

- expiration

### 💡 Why Use This?

To avoid writing complex Workbox setup by hand — just define caching rules declaratively and let the plugin do the rest.