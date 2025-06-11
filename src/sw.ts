import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare const __EXCLUDED_PATHS__: string[];
declare const __API_URL_PATTERN__: string;

const apiUrlPattern = new RegExp(__API_URL_PATTERN__);

registerRoute(
  ({ request }) =>
    ["document", "script", "style", "image", "font"].includes(
      request.destination
    ),
  new StaleWhileRevalidate({
    cacheName: "assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    apiUrlPattern.test(url.href) &&
    !__EXCLUDED_PATHS__.some((path) => url.pathname.startsWith(path)) &&
    request.method === "GET",
  new StaleWhileRevalidate({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  })
);
