## vite-plugin-cache

### Installation

```bash
npm install vite-plugin-cache
```

### Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { vitePluginCache } from 'vite-plugin-cache'

export default defineConfig({
  plugins: [
    vitePluginCache({
      swFileName: 'sw.js', // optional, default: 'vite-plugin-cache-worker.js'
      apiUrlPattern: /^https:\/\/example\.com\/api\// // optional, default: /^https:\/\/[^/]+\/api\//
    })
  ]
})

```

### What it does

- Injects a ```<script>``` to register a Service Worker on page load

- Generates a Service Worker that:

  - Caches assets (JS, CSS, images, etc.) using StaleWhileRevalidate

  - Caches GET API responses using NetworkFirst

### Output

On build, the plugin writes the Service Worker file to your outDir and registers it automatically.