# vite-plugin-cache

🧠 Zero-config Vite plugin that automatically injects a Workbox-based service worker with **"Stale While Revalidate"** strategy — ideal for basic caching of static assets and API requests.

## 📦 Features

- ✅ Caches JS, CSS, HTML, images, fonts, etc. by default
- 🔄 Stale-While-Revalidate strategy for all routes
- ⚙️ Auto-registers the service worker in `index.html`
- 🌐 Optional API proxying (for cross origin requests)
- 🧩 Respects Vite `base` path
- 🧼 Simple API, minimal config

---

## 🚀 Installation

```bash
npm i vite-plugin-cache --save-dev
```

## Usage

```ts
import { defineConfig } from 'vite';
import { vitePluginCache } from 'vite-plugin-cache';

export default defineConfig({
  plugins: [vitePluginCache()],
});
```

## Options

```ts
vitePluginCache({
  swFileName: 'my-sw.js', // Default: vite-cache-service-worker.js
  globPatterns: ['**/*.{js,css,html,svg}'], // Files to precache
  navigateFallback: '/index.html', // SPA fallback route
  apiUrlPatter: /^https:\/\/[^/]+\/api\// // Match pattern for API caching
  apiProxy: {
    prefix: '/api/'
    target: 'https://yourbackend.com'
  } // Rewrites origin-relative API requests to remote target
});
```

## 🌍 What gets cached?

```text
**/*.{js,css,html,svg,png,jpg,jpeg,woff2}
```
All other requests (including API) are handled via runtime caching using the StaleWhileRevalidate strategy.

##  🔁 How API proxy works

If you configure the apiProxy, all fetch requests that start with the given prefix (e.g. /api/) will be rewritten inside the Service Worker to the target host (e.g. https://api.example.com/api/).

This is useful when deploying to static hosts (e.g. GitHub Pages) that can't proxy backend requests themselves.

## Tips

- Ensure your API responses are cacheable (Cache-Control, avoid Set-Cookie, etc.)

- If you use the proxy mode, all API requests should be relative (e.g. /api/products)

- To debug: open DevTools → Application → Service Workers & Cache
