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
// default config included
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