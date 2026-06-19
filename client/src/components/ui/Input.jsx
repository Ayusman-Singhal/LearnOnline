/**
 * Input / Field — editorial warm form primitives.
 * Labeled, focus ring in accent color, inline error slot.
 */
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(function Input(
  { className, type = 'text', error, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full h-10 px-3.5',
        'bg-[var(--color-surface)] text-[var(--color-ink)] text-sm',
        'border rounded-xl placeholder:text-[var(--color-ink-faint)]',
        'transition-all duration-150 outline-none',
        error
          ? 'border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/20'
          : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15',
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

/** Textarea variant */
export const Textarea = forwardRef(function Textarea(
  { className, error, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3.5 py-2.5 min-h-[100px]',
        'bg-[var(--color-surface)] text-[var(--color-ink)] text-sm',
        'border rounded-xl placeholder:text-[var(--color-ink-faint)]',
        'transition-all duration-150 outline-none resize-y',
        error
          ? 'border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/20'
          : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15',
        className
      )}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'

/**
 * Field — label + input + inline error message composite.
 * Usage: <Field label="Email" error={errors.email?.message}><Input .../></Field>
 */
export function Field({ label, error, hint, required, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-xs font-semibold text-[var(--color-ink)] tracking-wide">
          {label}
          {required && <span className="text-[var(--color-accent)] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-[11px] text-[var(--color-ink-muted)]">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-[var(--color-error)] font-medium">{error}</p>
      )}
    </div>
  )
}

export { Input }
export default Input
