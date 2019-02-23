const CACHE_VERSION = 1;
const STATIC_CACHE = `static_cache_v${CACHE_VERSION}`;
const IMAGES_CACHE = `images_cache_v${CACHE_VERSION}`;
const OTHER_CACHE = `other_cache_v${CACHE_VERSION}`;
const allCaches = [
  STATIC_CACHE,
  IMAGES_CACHE,
  OTHER_CACHE,
];

const isImage = url => {
  const img_types = ['png', 'jpg', 'jpeg', 'gif'];
  img_types.forEach(type =>{
    if (url.endsWith(type)) {
      return true;
    }
  });
  return false;
};

const storeInCache = async (cacheName, requestCopy, responseCopy) => {
  const cache = await caches.open(cacheName);
  // console.log('Updating Cache');
  return cache.put(requestCopy, responseCopy);
};

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      // console.log('Current Cache: ', STATIC_CACHE);
      return cache.addAll([
        '/',
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg',
        '/index.html',
        '/restaurant.html',
        '/js/dbhelper.js',
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      // console.log('Clearing Old Caches...', cacheNames, allCaches);
      Promise.all(
        cacheNames.map(function(cacheName) {
          if (!allCaches.includes(cacheName)) {
            // console.log('Deleting: ', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        }
        try {
          return fetch(event.request).then(function (result) {
            const useCache = isImage(event.request.url) ? IMAGES_CACHE : STATIC_CACHE;
            storeInCache(useCache, event.request.clone(), result.clone());
            return result;
          });
        }
        catch (err) {
          console.log('Error: ', err);
        }
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
