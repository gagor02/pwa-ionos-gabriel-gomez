const CACHE_NAME = 'pwa-tasks-v1';
// Caché inicial estático
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Fase de Instalación (Installation)
// Aquí guardamos los archivos básicos en la caché al instalar el Service Worker.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Archivos en caché correctamente');
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Fase de Activación (Activation)
// Se ejecuta al actualizar el Service Worker. Sirve para limpiar cachés viejos.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Fase de Fetching (Proxy de Red)
// Interceptamos las peticiones HTTP. Estrategia: Cache First con Network Fallback.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si el recurso ya está en la caché, lo devolvemos inmediatamente (Offline)
      if (response) {
        return response;
      }
      
      // Si no está en caché, hacemos la petición a la red (Network)
      return fetch(event.request).then((networkResponse) => {
        // Validamos que la respuesta sea correcta antes de guardarla dinámicamente
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clonamos la respuesta porque un stream solo se puede consumir una vez
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Guardamos el nuevo recurso (los JS y CSS de Vite) en la caché
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // Aquí podrías devolver una página offline predeterminada si falla la red
      console.log('Falló la red y el recurso no está en caché.');
    })
  );
});