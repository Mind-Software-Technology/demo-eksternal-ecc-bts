import assert from 'node:assert/strict'
import test from 'node:test'
import { getNavItems, site } from './site.js'

// Regresi yang dijaga di sini: backend menamai field-nya `url` (form Filament
// ManageSiteConfig, DatabaseSeeder, migrasi 2026_08_24_150001). Frontend sempat
// membaca `n.path`, jadi `to` bernilai undefined, dan <Link href={undefined}>
// membuat Next memanggil formatUrl(undefined) — TypeError saat render yang
// menjatuhkan seluruh halaman, bukan cuma menunya.

// Persis potongan yang dikirim https://api.ecc-bts.id/api/site-config.
const LIVE_PAYLOAD = {
  nav_items: [
    { label: 'Beranda', url: '/' },
    { label: 'Kategori', url: '/kategori' },
    { label: 'Produk', url: '/produk' },
    { label: 'Kontak', url: '/kontak' },
  ],
}

test('membaca kunci `url` dari config, bukan `path`', () => {
  const items = getNavItems(LIVE_PAYLOAD)
  const beranda = items.find((i) => i.label === 'Beranda')

  assert.equal(beranda.to, '/')
  assert.deepEqual(
    items.slice(0, 4).map((i) => i.to),
    ['/', '/kategori', '/produk', '/kontak'],
  )
})

test('tidak pernah mengembalikan item ber-`to` kosong', () => {
  // Inilah invarian yang gagal saat crash: satu href undefined sudah cukup.
  for (const config of [
    LIVE_PAYLOAD,
    { nav_items: [{ label: 'Rusak' }] }, // admin menyimpan baris tanpa URL
    { nav_items: [{ label: 'Lama', path: '/kategori' }] }, // kunci gaya lama
    { nav_items: [] },
    null,
    undefined,
  ]) {
    for (const item of getNavItems(config)) {
      assert.ok(item.to, `item "${item.label}" punya to kosong: ${item.to}`)
    }
  }
})

test('item yang tidak dikenal config tetap muncul, tidak hilang', () => {
  const items = getNavItems(LIVE_PAYLOAD)
  // /kegiatan dan /tentang tidak ada di config di atas, tapi ada di nav statis.
  for (const path of ['/kegiatan', '/tentang']) {
    assert.ok(items.some((i) => i.to === path), `${path} hilang dari menu`)
  }
})

test('tanpa config sama sekali, pakai nav statis', () => {
  assert.deepEqual(getNavItems(undefined), site.nav)
})
