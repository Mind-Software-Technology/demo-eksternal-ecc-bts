import { site } from '../../data/site'

/** ECC-BTS brand lockup: logo image + wordmark text. */
export default function BrandMark() {
  return (
    <span className="brand" aria-label={`${site.brand} — ${site.brandFull}`}>
      {/* Sengaja TIDAK lazy: logo ada di navbar, selalu di atas lipatan —
          lazy justru menundanya dan bikin header berkedip. width/height
          diisi supaya browser memesan ruangnya sebelum gambar turun (anti
          layout shift); ukuran tampilnya tetap diatur .brand-logo di CSS. */}
      <img
        className="brand-logo"
        src="/images/logo.png"
        width={288}
        height={192}
        alt=""
        aria-hidden="true"
      />
      <span className="brand-text">
        <b>{site.brand}</b>
        <span>{site.brandFull}</span>
      </span>
    </span>
  )
}
