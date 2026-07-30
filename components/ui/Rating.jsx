import { FiStar } from 'react-icons/fi'

/** Compact star rating: filled stars + numeric value + optional review count. */
export default function Rating({ value = 5, reviews }) {
  const rounded = Math.round(value)
  return (
    <span className="rating" aria-label={`Rating ${value} dari 5`}>
      <span className="rating__stars" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <FiStar key={i} className={i < rounded ? 'is-on' : ''} />
        ))}
      </span>
      <b>{value.toFixed(1).replace('.', ',')}</b>
      {reviews != null && <small>({reviews})</small>}
    </span>
  )
}
