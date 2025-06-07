/**
 * Custom Service Worker Extensions
 * This file extends the Vite PWA generated service worker with custom functionality
 */

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  console.log('SW: Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: Skipping waiting and taking control');
    self.skipWaiting();
  }
});

// Handle the activate event to claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('SW: Service worker activated');
  
  // Take control of all clients immediately
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('SW: Claimed all clients');
    })
  );
});

// Handle install event
self.addEventListener('install', (event) => {
  console.log('SW: Service worker installed');
  
  // Don't skip waiting automatically - let the app control this
  // self.skipWaiting();
});

// Handle fetch events (this will be overridden by Workbox in production)
self.addEventListener('fetch', (event) => {
  // Let Workbox handle this in production
  // This is just for development/debugging
  if (self.location.hostname === 'localhost') {
    console.log('SW: Fetch event for:', event.request.url);
  }
});

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('SW: Push event received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'MMU Campus', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked');
  
  event.notification.close();
  
  // Focus or open the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clients) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not, open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle background sync (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      Promise.resolve()
    );
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('SW: Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('SW: Unhandled promise rejection:', event.reason);
});

console.log('SW: Custom service worker extensions loaded');
