/**
 * Modal — generic dialog with editorial spring animation.
 * Backdrop blur + spring scale-in (high-end-visual-design §5).
 * Usage:
 *   <Modal open={open} onClose={() => setOpen(false)} title="...">
 *     ...content...
 *   </Modal>
 */
import { useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { X } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'
import { scaleIn, backdrop } from '../../lib/motion'

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
  hideClose = false,
}) {
  const reduce = useReducedMotion()

  // Trap focus + escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[40] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={reduce ? {} : backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={reduce ? {} : scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'relative w-full z-10',
              'bg-[var(--color-surface)] rounded-2xl',
              'shadow-[0_24px_64px_rgba(26,23,20,0.18)]',
              'border border-[var(--color-border-soft)]',
              sizes[size],
              className
            )}
          >
            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[var(--color-border-soft)]">
                <div>
                  {title && (
                    <h2 className="font-semibold text-[var(--color-ink)] text-base leading-tight">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">{description}</p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ml-4',
                      'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]',
                      'hover:bg-[var(--color-surface-dim)] transition-colors',
                      'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
                    )}
                    aria-label="Close"
                  >
                    <X size={16} weight="bold" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
