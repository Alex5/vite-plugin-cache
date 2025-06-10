# vite-plugin-cache

🧠 Zero-config Vite plugin that automatically injects a Workbox-based service worker with **"Stale While Revalidate"** strategy — ideal for basic caching of static assets and API requests.

## 📦 Features

- ✅ Caches JS, CSS, HTML, images, fonts, etc. by default
- 🔄 Supports stale-while-revalidate caching strategy
- ⚙️ Auto-registers the service worker in your `index.html`
- 🧩 Compatible with `base` path in Vite config
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
});
```

## What gets cached?

```text
**/*.{js,css,html,svg,png,jpg,jpeg,woff2}
```

##  How it works

```
At build time, the plugin runs workbox-build.generateSW and generates a service worker in outDir (e.g. dist/service-worker.js).

It injects the service worker registration script into your final index.html.

No manual setup needed.
```

## Tips
```
Ensure your API responses are cacheable (Cache-Control, no Set-Cookie, etc.)

You can customize runtimeCaching by forking or extending the plugin
```

## Future plans
```
Support for custom service-worker.ts

Dev-time helper to inspect cache
```
