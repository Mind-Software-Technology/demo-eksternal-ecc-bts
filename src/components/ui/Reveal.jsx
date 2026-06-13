import { motion, useReducedMotion } from 'framer-motion'

/**
 * Scroll-reveal wrapper. Fades + translates children into view once.
 * Honors prefers-reduced-motion (renders without motion).
 *
 * Props: as, delay, y, className, ...rest
 */
export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  y = 24,
  className,
  ...rest
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] || motion.div

  if (reduce) {
    const Tag = as
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Container that staggers its <Reveal> / motion children. */
export function RevealGroup({ children, className, stagger = 0.1, ...rest }) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    )
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Child item for use inside <RevealGroup>. */
export function RevealItem({ children, className, y = 26, ...rest }) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    )
  }
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
