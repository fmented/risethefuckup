/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const worker = (self as unknown) as ServiceWorkerGlobalScope
const CACHE = `cache-${version}`;


const ASSETS = [
    ...build, // the app itself
    ...files  // everything in `static`
];


worker.addEventListener('install', (event) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);

    }

    event.waitUntil(addFilesToCache());
});

worker.addEventListener('activate', (event) => {
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

async function fetchAndCache(request: Request) {
    const cache = await caches.open(`offline${version}`);

    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    } catch (err) {
        const response = await cache.match(request);
        if (response) return response;

        throw err;
    }
}


worker.addEventListener('fetch', (event) => {

    if (event.request.method !== 'GET' || !event.request.url.startsWith("http")) return;

    async function respond(): Promise<Response> {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        // `build`/`files` can always be served from the cache
        if (ASSETS.includes(url.pathname)) {
            const from_cache = await cache.match(url.pathname);
            if (from_cache) return from_cache
        }

        // for everything else, try the network first, but
        // fall back to the cache if we're offline
        try {
            const response = await fetch(event.request);

            if (response.status === 200) {
                await cache.put(event.request, response.clone());
            }

            return response;
        } catch {

            return (await cache.match(event.request))!;
        }
    }

    event.respondWith(respond());
});

