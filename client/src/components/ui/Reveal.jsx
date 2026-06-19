/**
 * Reveal — scroll-reveal wrapper.
 * Default: clipUp (content rises from behind a mask — NOT generic fade-up).
 * Designer-grade variants: clipUp, clipLeft, scaleReveal, liftCard, fadeIn.
 *
 * Usage:
 *   <Reveal>                     ← clip-up from mask
 *   <Reveal variant="scaleReveal">
 *   <Reveal variant="liftCard" delay={0.1}>
 *   <Reveal as="section">
 */
import { motion, useReducedMotion } from 'motion/react'
import { clipUp, clipLeft, scaleReveal, liftCard, fadeIn } from '../../lib/motion'
import { cn } from '../../lib/utils'

const VARIANTS = { clipUp, clipLeft, scaleReveal, liftCard, fadeIn }

export default function Reveal({
  children,
  delay = 0,
  variant = 'clipUp',
  as: Tag = 'div',
  className,
  viewport = { once: true, amount: 0.1 },
  ...props
}) {
  const reduce = useReducedMotion()
  const vars = VARIANTS[variant] || clipUp

  // Convert delay (seconds) → custom index for variants that use (i = 0) => delay*i
  const customIndex = Math.round(delay / 0.09) || 0

  if (reduce) {
    // For reduced motion: just render children with no animation wrapper overhead
    const El = Tag
    return <El className={cn(className)} {...props}>{children}</El>
  }

  const MotionTag = motion[Tag] ?? motion.div

  return (
    <MotionTag
      variants={vars}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      custom={customIndex}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionTag>
  )
}
