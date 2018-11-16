var CACHE_NAME = 'stop-motion-code';
var CACHE_PATHS = [
  '/',
  '/animator.css',
  '/images/capture72.png',
  '/images/clear72.png',
  '/images/load72.png',
  '/images/off72.png',
  '/images/on72.png',
  '/images/playpause72.png',
  '/images/save72.png',
  '/images/stop-motion-192.png',
  '/images/stop-motion-512.png',
  '/images/stop-motion.svg',
  '/images/undo72.png',
  '/js/animator.js',
  '/js/main.js',
  '/js/webm.js'
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => {
    cache.addAll(CACHE_PATHS).then(() => {
      self.skipWaiting();
      clients.claim();
    });
  }));
});

self.addEventListener('fetch', evt => {
  evt.respondWith(caches.match(evt.request).then(response => {
    if (response) {
      return response;
    }
    const url = new URL(evt.request.url);
    if (url.origin == location.origin && url.pathname.startsWith('/cache/')) {
      let cacheRequest = evt.request.clone();
      return fetch(cacheRequest).then(response => {
	if (!response || response.status != 200 || response.type !== 'basic') {
	  return response;
	}
	let cacheResponse = response.clone();
	caches.open(CACHE_NAME).then(cache => {
	  cache.put(evt.request, cacheResponse);
	});
	return response;
      });
    }
    return fetch(evt.request);
  }));
});
