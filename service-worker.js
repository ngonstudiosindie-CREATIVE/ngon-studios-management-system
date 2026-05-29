const CACHE_NAME = 'ngon-management-system-v2';
const APP_PATH = '/ngon-studios-management-system/';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

function resolveAppUrl(url) {
  try {
    if (!url || url === '/' || url === './') {
      return self.registration.scope || APP_PATH;
    }

    if (url.startsWith('http')) {
      return url;
    }

    if (url.startsWith('/')) {
      return new URL(url, self.location.origin).href;
    }

    return new URL(url, self.registration.scope || self.location.href).href;
  } catch (error) {
    return self.registration.scope || APP_PATH;
  }
}

self.addEventListener('push', event => {
  let data = {
    title: 'NGON STUDIOS',
    body: 'New notification',
    url: self.registration.scope || APP_PATH
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (error) {
    data.body = event.data ? event.data.text() : data.body;
  }

  const options = {
    body: data.body,
    icon: data.icon || './icons/icon-192.png',
    badge: data.badge || './icons/icon-192.png',
    data: {
      url: resolveAppUrl(data.url)
    },
    tag: data.tag || 'ngon-studios-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'NGON STUDIOS', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const urlToOpen = resolveAppUrl(event.notification.data?.url);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(urlToOpen);

        if (clientUrl.origin === targetUrl.origin && clientUrl.pathname.startsWith(APP_PATH)) {
          if ('focus' in client) {
            client.focus();
          }
          if ('navigate' in client) {
            return client.navigate(urlToOpen);
          }
          return;
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
