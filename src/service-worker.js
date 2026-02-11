/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = /** @type {ServiceWorkerGlobalScope} */ (
  /** @type {unknown} */ (self)
);

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files // everything in `static`
];

sw.addEventListener('install', (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await sw.caches.open(CACHE);
    try {
      await cache.addAll(ASSETS);
    } catch (err) {
      console.error('Service Worker install error:', err);
    }
  }

  event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    try {
      for (const key of await sw.caches.keys()) {
        if (key !== CACHE) await sw.caches.delete(key);
      }
    } catch (err) {
      console.error('Service Worker activate error:', err);
    }
  }

  event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await sw.caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);
      if (response) return response;
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);
      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (err) {
      console.error('Service Worker fetch error:', err);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      // Fallback response if not in cache
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  }

  event.respondWith(respond());
});
