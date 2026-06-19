/**
 * Button — editorial fashion design system primitive.
 * Variants: primary (ink) | outline | ghost | accent (terracotta)
 * Sizes: sm | md | lg
 * Optional trailing icon with button-in-button physics (high-end-visual-design pattern).
 */
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  // Base — shared across all variants
  [
    'group relative inline-flex items-center justify-center gap-2',
    'font-semibold text-sm leading-none select-none cursor-pointer',
    'transition-all outline-none',
    // Focus ring — accent-colored for a11y
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]',
    // Press feedback
    'active:scale-[0.97]',
    // Disabled
    'disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-ink)] text-white',
          'hover:bg-[#2A2520]',
          'shadow-[0_1px_3px_rgba(26,23,20,0.2)]',
          'hover:shadow-[0_2px_8px_rgba(26,23,20,0.25)]',
        ],
        outline: [
          'border border-[var(--color-border)] bg-transparent text-[var(--color-ink)]',
          'hover:border-[var(--color-ink-muted)] hover:bg-[var(--color-surface-dim)]',
        ],
        ghost: [
          'bg-transparent text-[var(--color-ink-muted)]',
          'hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-dim)]',
        ],
        accent: [
          'bg-[var(--color-accent)] text-white',
          'hover:bg-[var(--color-accent-hover)]',
          'shadow-[0_1px_3px_rgba(184,85,58,0.3)]',
          'hover:shadow-[0_2px_8px_rgba(184,85,58,0.35)]',
        ],
      },
      size: {
        sm: 'h-8  px-4    text-xs  rounded-lg',
        md: 'h-10 px-5    text-sm  rounded-xl',
        lg: 'h-12 px-7    text-sm  rounded-xl',
        pill:'h-10 px-6    text-sm  rounded-full',
        'pill-lg': 'h-12 px-8 text-sm rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

/**
 * TrailingIcon — button-in-button nested icon (high-end-visual-design §4B).
 * Pass an icon element; it gets its own tinted circle that translates on hover.
 */
export function TrailingIcon({ children, variant = 'primary' }) {
  const circleClass = {
    primary: 'bg-white/10 text-white',
    accent:  'bg-white/10 text-white',
    outline: 'bg-[var(--color-ink)]/6 text-[var(--color-ink)]',
    ghost:   'bg-[var(--color-ink)]/6 text-[var(--color-ink)]',
  }[variant]

  return (
    <span
      className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
        'transition-transform duration-200',
        'group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105',
        circleClass
      )}
    >
      {children}
    </span>
  )
}

const Button = forwardRef(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})

Button.displayName = 'Button'

export { Button, buttonVariants }
export default Button
