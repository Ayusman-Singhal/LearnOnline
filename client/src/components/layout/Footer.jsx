import { Link } from 'react-router-dom'

const NAVIGATE = [
  { label: 'Courses',    href: '/courses' },
  { label: 'About',      href: '/about' },
  { label: 'Blog',       href: '/blog' },
  { label: 'Careers',   href: '/careers' },
]

const LEGAL = [
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Terms of service', href: '/terms' },
  { label: 'Refund policy',  href: '/refund' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-canvas)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Top — brand + nav */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-10 md:gap-16 pb-12 border-b border-[var(--color-border-soft)]">

          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="relative w-7 h-7 rounded-[8px] bg-[var(--color-ink)] flex items-center justify-center overflow-hidden flex-shrink-0">
                <span
                  className="font-serif font-black text-white text-[13px] leading-none tracking-tight"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  L
                </span>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--color-accent)] rounded-tl-sm" />
              </div>
              <span className="font-semibold text-[var(--color-ink)] text-[14px] tracking-tight">
                LearnOnline
              </span>
            </Link>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed max-w-[240px]">
              Expert-led courses in design, tech, and business learn from home and earn verified certificates.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <p className="text-[10px] font-semibold text-[var(--color-ink)] uppercase tracking-[0.15em] mb-4">
              Navigate
            </p>
            <ul className="space-y-2.5">
              {NAVIGATE.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[10px] font-semibold text-[var(--color-ink)] uppercase tracking-[0.15em] mb-4">
              Legal
            </p>
            <ul className="space-y-2.5">
              {LEGAL.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-ink-faint)]">
            &copy; {new Date().getFullYear()} LearnOnline. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-ink-faint)]">
            Built with care for learners everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
