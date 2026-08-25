import assert from 'node:assert/strict'
import test from 'node:test'
import { getHero, getNavItems, site, HERO_FALLBACK } from './site.js'

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

// getHero: teks admin menang, tapi tidak boleh meninggalkan lubang di hero.

test('teks dari admin menimpa teks bawaan', () => {
  const hero = getHero({ hero: { title: 'Judul Baru', stat_quality_value: '99%' } })

  assert.equal(hero.title, 'Judul Baru')
  assert.equal(hero.stat_quality_value, '99%')
  // Yang tidak diisi admin tetap memakai bawaannya.
  assert.equal(hero.title_highlight, HERO_FALLBACK.title_highlight)
})

test('field kosong jatuh ke teks bawaan, bukan jadi hero melompong', () => {
  const hero = getHero({
    hero: { title: '', title_highlight: '   ', subtitle: null, eyebrow: 42 },
  })

  assert.equal(hero.title, HERO_FALLBACK.title)
  assert.equal(hero.title_highlight, HERO_FALLBACK.title_highlight)
  assert.equal(hero.subtitle, HERO_FALLBACK.subtitle)
  assert.equal(hero.eyebrow, HERO_FALLBACK.eyebrow)
})

test('config belum termuat atau gagal -> seluruh teks bawaan', () => {
  for (const config of [null, undefined, {}, { hero: {} }]) {
    assert.deepEqual(getHero(config), HERO_FALLBACK)
  }
})

test('getHero tidak pernah mengubah HERO_FALLBACK', () => {
  getHero({ hero: { title: 'Diubah' } })
  assert.equal(HERO_FALLBACK.title, 'Temukan Layanan untuk')
})
