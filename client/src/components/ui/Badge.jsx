/**
 * Badge — two variants:
 *   Eyebrow: uppercase micro-tracking pill for section labels
 *   Tag:     square status/category tag with warm pastels
 */
import { cn } from '../../lib/utils'

const eyebrowColors = {
  default: 'bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-ink-muted)]',
  accent:  'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  error:   'bg-[var(--color-error-soft)] text-[var(--color-error)]',
}

const tagColors = {
  default:    'bg-[var(--color-surface-dim)] text-[var(--color-ink-muted)]',
  accent:     'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  success:    'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  error:      'bg-[var(--color-error-soft)] text-[var(--color-error)]',
  // Category colors for course tags
  Design:         'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  Development:    'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  'Data Science': 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  Business:       'bg-amber-50 text-amber-700',
  Marketing:      'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  Photography:    'bg-amber-50 text-amber-700',
}

/** Eyebrow tag — precedes headings */
export function Eyebrow({ children, color = 'default', className, icon, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'px-3 py-1 rounded-full',
        'text-[10px] font-semibold uppercase tracking-[0.15em]',
        eyebrowColors[color] || eyebrowColors.default,
        className
      )}
      {...props}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      {children}
    </span>
  )
}

/** Tag — category, status, metadata */
export function Tag({ children, color = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center',
        'px-2 py-0.5 rounded-md',
        'text-[11px] font-semibold',
        tagColors[color] ?? tagColors.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Eyebrow
