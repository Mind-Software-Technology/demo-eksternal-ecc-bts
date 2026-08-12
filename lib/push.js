import { api } from './api'

// ───────────────────────────────────────────────────────────────────────────
// Pendaftaran web push: service worker + langganan push, lalu langganannya
// dititipkan ke backend supaya Laravel bisa mengirim notifikasi kapan saja —
// termasuk saat situs sudah ditutup.
// ───────────────────────────────────────────────────────────────────────────

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

export const pushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

/** VAPID key datang sebagai base64url; PushManager minta Uint8Array mentah. */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(raw, (char) => char.charCodeAt(0))
}

/** Apakah langganan ini dibuat dengan VAPID key yang sedang berlaku? */
function matchesCurrentKey(subscription) {
  const existing = subscription.options?.applicationServerKey
  if (!existing) return false

  const a = new Uint8Array(existing)
  const b = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  return a.length === b.length && a.every((byte, i) => byte === b[i])
}

/**
 * Daftarkan browser ini untuk web push. Aman dipanggil berkali-kali:
 * pushManager mengembalikan langganan yang sudah ada, dan endpoint yang sama
 * cuma diperbarui di backend, tidak digandakan.
 *
 * Mengembalikan true kalau langganan aktif.
 */
export async function subscribeToPush() {
  if (!pushSupported() || !VAPID_PUBLIC_KEY) return false
  if (Notification.permission !== 'granted') return false

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    let subscription = await registration.pushManager.getSubscription()

    // Langganan terikat permanen ke VAPID key yang dipakai saat membuatnya.
    // Kalau kuncinya berganti (server di-generate ulang, atau nilai di server
    // dan di build frontend sempat berbeda), langganan lama tetap terlihat
    // hidup tapi server tidak bisa lagi mengirim ke sana. Tanpa pemeriksaan
    // ini browser tersebut memakai ulang langganan mati itu selamanya dan
    // tidak akan pernah pulih sendiri.
    if (subscription && !matchesCurrentKey(subscription)) {
      await subscription.unsubscribe()
      await api.push.unsubscribe(subscription.endpoint).catch(() => {})
      subscription = null
    }

    subscription ??= await registration.pushManager.subscribe({
      // Wajib true: Chrome menolak langganan yang boleh mengirim push senyap.
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    await api.push.subscribe(subscription.toJSON())
    return true
  } catch {
    // Izin dicabut, VAPID key tidak cocok dengan langganan lama, atau browser
    // tidak mendukung — lonceng dan polling tetap jalan sebagai cadangan.
    return false
  }
}

/**
 * Lepas langganan browser ini — dipanggil saat logout supaya notifikasi
 * pesanan orang lain tidak muncul di perangkat yang sudah ganti pemilik.
 */
export async function unsubscribeFromPush() {
  if (!pushSupported()) return

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    const subscription = await registration?.pushManager.getSubscription()
    if (!subscription) return

    // Lepas di browser lebih dulu: itu selalu berhasil dan langsung
    // menghentikan push. Laporan ke backend menyusul dan boleh gagal —
    // langganan yang endpoint-nya sudah mati akan dibuang sendiri oleh
    // handler laporan paket webpush saat pengiriman berikutnya ditolak.
    const { endpoint } = subscription
    await subscription.unsubscribe()
    await api.push.unsubscribe(endpoint).catch(() => {})
  } catch {
    /* tidak ada yang bisa dilakukan kalau gagal — biarkan */
  }
}
