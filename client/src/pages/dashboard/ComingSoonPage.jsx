import { motion, useReducedMotion } from 'motion/react'
import { HourglassMedium } from '@phosphor-icons/react'
import { spring } from '../../lib/motion'

export default function ComingSoonPage({ title = 'Coming soon' }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring.soft }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-center mb-5">
        <HourglassMedium size={26} className="text-[var(--color-ink-muted)]" weight="fill" />
      </div>
      <p
        className="text-xl font-black text-[var(--color-ink)] mb-1"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {title}
      </p>
      <p className="text-sm text-[var(--color-ink-muted)] max-w-xs">
        This section is being built. Check back soon.
      </p>
    </motion.div>
  )
}
