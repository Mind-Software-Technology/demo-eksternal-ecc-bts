import { site } from '../../data/site'

/** ECC-BTS brand lockup: logo image + wordmark text. */
export default function BrandMark() {
  return (
    <span className="brand" aria-label={`${site.brand} — ${site.brandFull}`}>
      <img className="brand-logo" src="/images/logo.png" alt="" aria-hidden="true" />
      <span className="brand-text">
        <b>{site.brand}</b>
        <span>{site.brandFull}</span>
      </span>
    </span>
  )
}
