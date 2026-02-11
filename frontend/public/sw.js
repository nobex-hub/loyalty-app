self.addEventListener('push', (event) => {
  let data = { title: 'Loyalty Rewards', body: 'You have a new notification' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    // Use default
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.data || {},
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const data = event.notification.data || {};
  let url = '/';

  if (data.type === 'POINTS_EARNED') url = '/history';
  else if (data.type === 'TIER_UPGRADE') url = '/profile';
  else if (data.type === 'REVIEW_APPROVED' || data.type === 'REVIEW_REJECTED') url = '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
