importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

try {
  firebase.initializeApp({
    apiKey: "AIzaSyCcPAkw9JOPqrRXfhffX2cOm5mr9fE5lBE",
    authDomain: "sam-sk-mr.firebaseapp.com",
    projectId: "sam-sk-mr",
    storageBucket: "sam-sk-mr.firebasestorage.app",
    messagingSenderId: "69005377753",
    appId: "1:69005377753:web:f9af8d42bf0fc10ec87ec8"
  });

  const messaging = firebase.messaging();

  // Listen to background notifications
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);

    // If payload contains a notification block, Firebase FCM SDK automatically displays it.
    if (payload.notification) {
      console.log('[firebase-messaging-sw.js] Automatic FCM notification present. Skipping manual display to prevent duplication.');
      return;
    }

    const title = payload.data?.title || 'Smart Agriculture Marketplace';
    const body = payload.data?.body || '';
    const icon = '/favicon.png';

    const notificationOptions = {
      body,
      icon,
      data: payload.data || {}
    };

    self.registration.showNotification(title, notificationOptions);
  });

  // Handle click on native background notification banner
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    const clickAction = data.click_action;
    const type = data.type;
    const referenceId = data.referenceId;
    const referenceType = data.referenceType;

    // Generate redirect URL based on data
    let redirectUrl = '/';
    if (referenceType === 'Order' && referenceId) {
      redirectUrl = `/buyer-dashboard?tab=orders&id=${referenceId}`;
    }

    const targetUrl = clickAction || redirectUrl;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url && 'focus' in client) {
            return client.focus().then(() => {
              if (client.navigate) {
                return client.navigate(targetUrl);
              }
            });
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  });
} catch (error) {
  console.error('[firebase-messaging-sw.js] Service worker initialization error:', error);
}
