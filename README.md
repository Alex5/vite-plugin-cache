# vite-plugin-cache

A Vite plugin that auto-generates and registers a Workbox-based service worker to cache your API requests and static assets.

## ✨ Features

- 🔧 Auto-generates a `service worker` using Workbox at build time
- 🧠 Built-in support for common Workbox strategies:
  - `stale-while-revalidate`
  - `cache-first`
  - `network-first`
  - `cache-only`
  - `network-only`
- 🧩 Supports Workbox plugins like `ExpirationPlugin`
- 📚 Built-in Workbox recipes: `imageCache`, `pageCache`, `staticResourceCache`, `googleFontsCache`
- ⚡ Auto-injects service worker registration into your HTML

---

## 🚀 Installation

```bash
npm install vite-plugin-cache --save-dev
```

---

## ⚙️ Basic Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { vitePluginCache } from './vite-plugin-cache';

export default defineConfig({
  plugins: [vitePluginCache()],
});
```

This will use the default configuration:

- Caches all `GET` requests to `/api/*` using `stale-while-revalidate`
- Applies `ExpirationPlugin` with 100 entries and 60 seconds age
- Injects service worker loader in `index.html`

---

## 🧠 Advanced Usage

### Custom Cache Config

You can override the default caching rules with your own:

```ts
vitePluginCache({
  config: {
    'custom-api-cache': {
      match: ({ url }) => url.pathname.startsWith('/v1/'),
      strategy: 'network-first',
      plugins: {
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 120,
        },
      },
    },
  },
});
```

### Using Built-in Recipes

Workbox recipes simplify common patterns:

```ts
vitePluginCache({
  recipies: {
    imageCache: {},
    googleFontsCache: {},
    pageCache: null,
  },
});
```

### Function-based Config

You can dynamically generate config:

```ts
vitePluginCache({
  config: (defaultConfig) => ({
    ...defaultConfig,
    'docs-cache': {
      match: ({ url }) => url.pathname.startsWith('/docs/'),
      strategy: 'cache-first',
    },
  }),
});
```

---

## 🔌 Supported Strategies

| Strategy                 | Description                                           |
|--------------------------|-------------------------------------------------------|
| `stale-while-revalidate` | Returns cached response immediately, updates in background |
| `network-first`          | Tries network first, fallback to cache               |
| `cache-first`            | Tries cache first, fallback to network               |
| `network-only`           | Always fetches from network                          |
| `cache-only`             | Only uses the cache                                  |

---

## 🧩 Plugin Support

Currently supported:

- `expiration`: Uses `ExpirationPlugin` to limit cache size and entry age.

```ts
plugins: {
  expiration: {
    maxEntries: 200,
    maxAgeSeconds: 3600,
  },
}
```

---

## 📦 Output

The generated service worker will be placed in your build output (e.g., `dist/vite-plugin-cache-service-worker.js`) and automatically registered in the browser.

---

## 📝 License

MIT
