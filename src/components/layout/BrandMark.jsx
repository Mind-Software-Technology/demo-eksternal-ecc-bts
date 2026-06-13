import { FiBookOpen } from 'react-icons/fi'
import { site } from '../../data/site'

/** ECC-BTS wordmark: gradient book mark + brand text. */
export default function BrandMark() {
  return (
    <span className="brand" aria-label={`${site.brand} — ${site.brandFull}`}>
      <span className="brand-mark" aria-hidden="true">
        <FiBookOpen />
      </span>
      <span className="brand-text">
        <b>{site.brand}</b>
        <span>{site.brandFull}</span>
      </span>
    </span>
  )
}
