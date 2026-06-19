import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function SignInPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-canvas)] flex flex-col">
      <div className="flex items-center justify-center flex-1 px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Wordmark */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="relative w-9 h-9 rounded-[10px] bg-[var(--color-ink)] flex items-center justify-center overflow-hidden">
                <span
                  className="font-black text-white text-[16px] leading-none"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  L
                </span>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--color-accent)] rounded-tl-sm" />
              </div>
              <span className="font-semibold text-[var(--color-ink)] text-[15px] tracking-tight">
                LearnOnline
              </span>
            </Link>
            <h1
              className="text-2xl font-black text-[var(--color-ink)] tracking-tight"
              style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.025em' }}
            >
              Welcome back
            </h1>
            <p className="text-[var(--color-ink-muted)] text-sm mt-1">
              Sign in to continue learning
            </p>
          </div>

          <div className="flex justify-center">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              redirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 bg-transparent p-0 w-full',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: [
                    'border border-[var(--color-border)] bg-[var(--color-surface)]',
                    'hover:bg-[var(--color-surface-dim)] rounded-xl font-medium',
                    'text-[var(--color-ink)] transition-colors',
                  ].join(' '),
                  dividerLine: 'bg-[var(--color-border)]',
                  dividerText: 'text-[var(--color-ink-faint)] text-xs',
                  formFieldInput: [
                    'border border-[var(--color-border)] rounded-xl',
                    'text-[var(--color-ink)] bg-[var(--color-surface)]',
                    'focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]',
                  ].join(' '),
                  formFieldLabel: 'text-[var(--color-ink)] text-xs font-semibold',
                  formButtonPrimary: [
                    'bg-[var(--color-ink)] hover:bg-[#2A2520]',
                    'rounded-xl font-semibold text-sm',
                    'transition-colors',
                  ].join(' '),
                  footerActionLink: 'text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium',
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
