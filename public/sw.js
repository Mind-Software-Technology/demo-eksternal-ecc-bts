/* Service worker web push ECC-BTS.
 *
 * Berjalan di luar halaman, jadi notifikasi tetap sampai walaupun situs sudah
 * ditutup sepenuhnya — beda dengan Notification API biasa yang mati begitu tab
 * terakhir hilang.
 *
 * Bentuk payload di bawah dikirim oleh WebPushMessage::toArray() di backend
 * (app/Notifications/*.php). Kalau field di sana berubah, ubah juga di sini.
 */

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    // Push tanpa payload JSON bukan milik kita — abaikan diam-diam daripada
    // memunculkan notifikasi kosong.
    return
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'ECC-BTS', {
      body: payload.body || '',
      icon: payload.icon || '/images/logo.png',
      badge: payload.badge || '/images/logo.png',
      tag: payload.tag,
      data: payload.data || {},
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Pakai tab ECC-BTS yang sudah terbuka kalau ada — membuka jendela baru
      // tiap kali notifikasi diklik cepat sekali jadi mengganggu.
      const existing = clients.find((client) => 'focus' in client)
      if (existing) {
        return existing.focus().then((client) => client.navigate(target))
      }
      return self.clients.openWindow(target)
    }),
  )
})
