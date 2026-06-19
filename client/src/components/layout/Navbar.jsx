import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { List, X, ArrowRight } from '@phosphor-icons/react'
import { ease, dur } from '../../lib/motion'
import { cn } from '../../lib/utils'

const NAV_LINKS = [
  { label: 'Courses',  href: '/courses' },
  { label: 'About',    href: '/about' },
  { label: 'Blog',     href: '/blog' },
]

/** Serif wordmark */
function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
      {/* Logo mark — ink square with terracotta corner accent */}
      <div className="relative w-7 h-7 rounded-[8px] bg-[var(--color-ink)] flex items-center justify-center overflow-hidden">
        <span
          className="font-serif font-black text-white text-[13px] leading-none tracking-tight select-none"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          L
        </span>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--color-accent)] rounded-tl-sm" />
      </div>
      <span
        className="font-semibold text-[var(--color-ink)] text-[14px] tracking-tight leading-none"
      >
        LearnOnline
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const isDashboard = location.pathname.startsWith('/dashboard')
  if (isDashboard) return null

  const transition = {
    duration: dur.normal,
    ease: ease.outExpo,
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[50] flex justify-center pt-4 px-4">
        <motion.nav
          animate={{
            backdropFilter: scrolled ? 'blur(16px)' : 'blur(8px)',
          }}
          transition={transition}
          className={cn(
            'flex items-center gap-4 px-4 h-[52px] rounded-full w-full max-w-4xl',
            'transition-all',
            scrolled
              ? 'bg-[var(--color-canvas)]/92 shadow-[0_2px_20px_rgba(26,23,20,0.08)] border border-[var(--color-border)]/80'
              : 'bg-[var(--color-canvas)]/75 border border-[var(--color-border)]/50'
          )}
          style={{ transition: `all ${dur.normal * 1000}ms cubic-bezier(${ease.outExpo.join(',')})` }}
        >
          <Wordmark />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'text-[var(--color-ink)] bg-[var(--color-surface)]'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-dim)]'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <SignedOut>
              <Link
                to="/sign-in"
                className="text-[13px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors px-2 py-1.5"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className={cn(
                  'group inline-flex items-center gap-2',
                  'h-8 pl-4 pr-2 rounded-full',
                  'bg-[var(--color-ink)] text-white text-[12px] font-semibold',
                  'hover:bg-[#2A2520] active:scale-[0.97]',
                  'transition-all shadow-[0_1px_3px_rgba(26,23,20,0.2)]',
                )}
                style={{ transition: `all 150ms cubic-bezier(${ease.outExpo.join(',')})` }}
              >
                Get started
                <span className={cn(
                  'w-5 h-5 rounded-full bg-white/10',
                  'flex items-center justify-center',
                  'transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105'
                )}>
                  <ArrowRight size={10} weight="bold" />
                </span>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-[13px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors mr-1"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn(
              'md:hidden ml-auto w-8 h-8',
              'flex items-center justify-center rounded-lg',
              'hover:bg-[var(--color-surface-dim)] transition-colors relative',
              'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="x"
                  initial={reduce ? false : { opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={18} weight="bold" className="text-[var(--color-ink)]" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={reduce ? false : { opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.15 }}
                >
                  <List size={18} weight="bold" className="text-[var(--color-ink)]" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.nav>
      </header>

      {/* Mobile overlay — full-screen with staggered reveals */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur.normal, ease: ease.outExpo }}
            className="fixed inset-0 z-[40] pt-20 px-5 bg-[var(--color-canvas)]/97 backdrop-blur-xl md:hidden"
          >
            {/* Decorative serif initial — fashion editorial touch */}
            <span
              className="absolute top-24 right-6 text-[120px] font-black text-[var(--color-border)] leading-none select-none pointer-events-none"
              style={{ fontFamily: 'var(--font-serif)' }}
              aria-hidden
            >
              L
            </span>

            <nav className="flex flex-col gap-1 relative z-10">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    duration: dur.moderate,
                    ease: ease.outExpo,
                  }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      'block py-3.5 text-2xl font-semibold tracking-tight',
                      'border-b border-[var(--color-border-soft)]',
                      'text-[var(--color-ink)] hover:text-[var(--color-accent)]',
                      'transition-colors duration-150',
                    )}
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.06 + 0.05, duration: dur.moderate, ease: ease.outExpo }}
                className="mt-6 flex flex-col gap-2"
              >
                <SignedOut>
                  <Link
                    to="/sign-in"
                    className={cn(
                      'block px-5 py-3.5 text-center rounded-xl',
                      'border border-[var(--color-border)] text-[var(--color-ink)] font-semibold',
                      'hover:bg-[var(--color-surface-dim)] transition-colors'
                    )}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/sign-up"
                    className={cn(
                      'block px-5 py-3.5 text-center rounded-xl',
                      'bg-[var(--color-ink)] text-white font-semibold',
                      'hover:bg-[#2A2520] transition-colors'
                    )}
                  >
                    Get started
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    to="/dashboard"
                    className={cn(
                      'block px-5 py-3.5 text-center rounded-xl',
                      'bg-[var(--color-ink)] text-white font-semibold',
                      'hover:bg-[#2A2520] transition-colors'
                    )}
                  >
                    Go to dashboard
                  </Link>
                </SignedIn>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
