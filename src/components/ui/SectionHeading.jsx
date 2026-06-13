import Reveal from './Reveal'

/** Standard section heading: eyebrow + title + optional subtitle. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  dark = false,
}) {
  return (
    <Reveal className={`heading ${center ? 'heading--center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 style={{ marginTop: '0.9rem', color: dark ? '#fff' : undefined }}>
        {title}
      </h2>
      {subtitle && (
        <p className="lead" style={{ color: dark ? '#d7e3ff' : undefined }}>
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}
