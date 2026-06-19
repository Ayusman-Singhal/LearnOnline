/**
 * Shared motion vocabulary — editorial fashion standard.
 * Based on emil-design-eng: frequency check, spring physics, GPU-only.
 *
 * Key rule: NO simple opacity+translateY fadeUp everywhere.
 * Use clip-path reveals, scale origins, springs, character staggers.
 */

// ── Easings ──────────────────────────────────────────────────────
export const ease = {
  outExpo:   [0.16, 1, 0.3, 1],
  inOutExpo: [0.77, 0, 0.175, 1],
  spring:    [0.32, 0.72, 0, 1],
  gentle:    [0.25, 0.46, 0.45, 0.94],
  back:      [0.34, 1.56, 0.64, 1],  // slight overshoot
}

// Spring config
export const spring = {
  soft:    { type: 'spring', stiffness: 280, damping: 28 },
  snappy:  { type: 'spring', stiffness: 420, damping: 26 },
  gentle:  { type: 'spring', stiffness: 200, damping: 32 },
  bouncy:  { type: 'spring', stiffness: 340, damping: 20 },
  overlay: { type: 'spring', stiffness: 360, damping: 34 },
}

// ── Durations ─────────────────────────────────────────────────────
export const dur = {
  instant:  0.1,
  fast:     0.18,
  normal:   0.25,
  moderate: 0.45,
  slow:     0.65,
  reveal:   0.8,
}

// ── Reveal variants (non-generic) ────────────────────────────────

/**
 * clipUp — content revealed through rising clip-path.
 * Looks like the text is sliding out of a drawer.
 */
export const clipUp = {
  hidden:  { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
  visible: (i = 0) => ({
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: {
      clipPath: { duration: dur.reveal, delay: i * 0.09, ease: ease.outExpo },
      opacity:  { duration: 0.1, delay: i * 0.09 },
    },
  }),
}

/**
 * clipLeft — horizontal wipe reveal from left edge.
 */
export const clipLeft = {
  hidden:  { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
  visible: (i = 0) => ({
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: {
      clipPath: { duration: dur.reveal, delay: i * 0.08, ease: ease.outExpo },
      opacity:  { duration: 0.05, delay: i * 0.08 },
    },
  }),
}

/**
 * scaleReveal — scale from 0.85 + blur dissolve.
 * More interesting than plain fade.
 */
export const scaleReveal = {
  hidden: { scale: 0.88, opacity: 0, filter: 'blur(8px)' },
  visible: (i = 0) => ({
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: dur.reveal,
      delay: i * 0.08,
      ease: ease.outExpo,
    },
  }),
}

/**
 * liftCard — card lifts from below with spring + slight rotation snap.
 */
export const liftCard = {
  hidden: { y: 40, opacity: 0, rotateX: 4 },
  visible: (i = 0) => ({
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: dur.reveal,
      delay: i * 0.07,
      ease: ease.spring,
    },
  }),
}

/**
 * fadeIn — plain cross-dissolve. Use ONLY for tertiary elements.
 * Not for headings, cards, or hero content.
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: dur.moderate, delay: i * 0.06 },
  }),
}

// ── Stagger container ─────────────────────────────────────────────
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
}

// ── Overlay / Modal ───────────────────────────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.93, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...spring.overlay },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: { duration: dur.fast, ease: ease.inOutExpo },
  },
}

export const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: dur.fast } },
  exit:   { opacity: 0, transition: { duration: dur.fast } },
}

// ── Sidebar/panel ─────────────────────────────────────────────────
export const slideInLeft = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: dur.moderate, ease: ease.spring } },
  exit:   { x: '-100%', transition: { duration: dur.fast, ease: ease.inOutExpo } },
}
