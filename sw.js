var CACHE_NAME = 'stop-motion-code';
var CACHE_PATHS = [
  '/stop-motion/',
  '/stop-motion/animator.css',
  '/stop-motion/images/capture72.png',
  '/stop-motion/images/clear72.png',
  '/stop-motion/images/load72.png',
  '/stop-motion/images/off72.png',
  '/stop-motion/images/on72.png',
  '/stop-motion/images/playpause72.png',
  '/stop-motion/images/save72.png',
  '/stop-motion/images/stop-motion-192.png',
  '/stop-motion/images/stop-motion-512.png',
  '/stop-motion/images/stop-motion.svg',
  '/stop-motion/images/undo72.png',
  '/stop-motion/js/animator.js',
  '/stop-motion/js/main.js',
  '/stop-motion/js/webm.js'
];
var CACHE_TTL = 60 * 60 * 24;
var LAST_UPDATE = null;

self.addEventListener('message', evt => {
  if (evt.data.hasOwnProperty('last_update')) {
    if (Date.now() - evt.data['last_update'] > CACHE_TTL) {
      // update cache
    }
  }
});

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => {
    cache.addAll(CACHE_PATHS).then(() => {
      self.skipWaiting();
      self.clients.claim();
    });
  }));
});

/*
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
*/
