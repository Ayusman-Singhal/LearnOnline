/**
 * Card — editorial warm-hairline card system.
 * Variants: default | elevated | bezel (double-bezel high-end-visual-design §4A)
 */
import { cn } from '../../lib/utils'

export function Card({ className, variant = 'default', hover = false, children, ...props }) {
  const base = 'rounded-2xl transition-all duration-200'

  const variants = {
    default:  'bg-[var(--color-surface)] border border-[var(--color-border)]',
    dim:      'bg-[var(--color-surface-dim)] border border-[var(--color-border-soft)]',
    elevated: 'bg-[var(--color-surface)] shadow-[0_2px_16px_rgba(26,23,20,0.07)]',
    canvas:   'bg-[var(--color-canvas)] border border-[var(--color-border-soft)]',
    // Double-bezel: outer shell + inner core
    bezel: [
      'bg-[rgba(26,23,20,0.04)] ring-1 ring-[rgba(26,23,20,0.06)]',
      'p-1.5 rounded-[2rem]',
    ].join(' '),
  }

  const hoverClass = hover
    ? 'hover:shadow-[0_4px_20px_rgba(26,23,20,0.09)] hover:-translate-y-0.5 cursor-pointer'
    : ''

  return (
    <div className={cn(base, variants[variant], hoverClass, className)} {...props}>
      {children}
    </div>
  )
}

/** Inner core of a double-bezel card */
export function CardCore({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[calc(2rem-0.375rem)] bg-[var(--color-surface)]',
        'shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]',
        'border border-[var(--color-border-soft)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-5 md:p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('px-5 md:px-6 pb-5 pt-3 border-t border-[var(--color-border-soft)]', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
