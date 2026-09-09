import { Icon } from '../../data/icons'

/** Compact thumbnail button for the "Layanan Unggulan" nav grid — pure
 * navigation/preview, not a duplicate of the detail panel: icon + a
 * one-line label only. Clicking it swaps the active service shown in the
 * sibling detail panel. */
export default function ServiceNameCard({ service, index, active, onClick }) {
  return (
    <button
      type="button"
      className={`service-name-card${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="service-name-card__index">{String(index + 1).padStart(2, '0')}</span>
      <div className="service-name-card__icon">
        <Icon name={service.icon} />
      </div>
      <h3>{service.title}</h3>
    </button>
  )
}
