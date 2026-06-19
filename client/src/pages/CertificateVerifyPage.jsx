import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, Trophy, ArrowLeft, House, BookOpen } from '@phosphor-icons/react'
import { useAuth } from '@clerk/clerk-react'

export default function CertificateVerifyPage() {
  const { certNumber } = useParams()
  const { isSignedIn } = useAuth()

  const { data: cert, isLoading, error } = useQuery({
    queryKey: ['cert-verify', certNumber],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/certificates/verify/${certNumber}`)
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
    retry: false,
  })

  return (
    <div className="min-h-[100dvh] bg-[var(--color-canvas)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] text-sm transition-colors">
            <ArrowLeft size={14} /> Home
          </Link>
          <span className="text-[var(--color-border)]">·</span>
          {isSignedIn ? (
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] text-sm transition-colors">
              <House size={14} /> Dashboard
            </Link>
          ) : (
            <Link to="/courses" className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] text-sm transition-colors">
              <BookOpen size={14} /> Browse courses
            </Link>
          )}
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-5 flex items-center gap-3 ${isLoading ? 'bg-[var(--color-canvas)]' : error ? 'bg-red-50' : 'bg-[var(--color-ink)]'}`}>
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-[var(--color-border)] animate-pulse" />
            ) : error ? (
              <XCircle size={32} weight="fill" className="text-red-400" />
            ) : (
              <Trophy size={32} weight="fill" className="text-white" />
            )}
            <div>
              <p className={`font-bold text-sm ${error ? 'text-red-700' : isLoading ? 'text-[var(--color-ink-muted)]' : 'text-white'}`}>
                {isLoading ? 'Verifying...' : error ? 'Certificate not found' : 'Verified Certificate'}
              </p>
              <p className={`text-xs mt-0.5 ${error ? 'text-red-400' : isLoading ? 'text-[var(--color-ink-faint)]' : 'text-white/70'}`}>
                LearnOnline · {certNumber}
              </p>
            </div>
          </div>

          <div className="px-6 py-5">
            {isLoading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-3/4 bg-[var(--color-canvas)] rounded" />
                <div className="h-4 w-1/2 bg-[var(--color-canvas)] rounded" />
                <div className="h-4 w-2/3 bg-[var(--color-canvas)] rounded" />
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <p className="text-sm text-[var(--color-ink-muted)]">No certificate matches this ID.</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">Check the ID and try again.</p>
              </div>
            )}

            {cert && (
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <CheckCircle size={18} weight="fill" className="text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--color-ink-muted)] font-semibold uppercase tracking-wide">Student</p>
                    <p className="font-bold text-[var(--color-ink)]">{cert.users?.name || '—'}</p>
                  </div>
                </div>

                <div className="h-px bg-[var(--color-canvas)]" />

                <div>
                  <p className="text-xs text-[var(--color-ink-muted)] font-semibold uppercase tracking-wide mb-1">Course completed</p>
                  <p className="font-semibold text-[var(--color-ink)]">{cert.courses?.title || '—'}</p>
                  {cert.courses?.users?.name && (
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">by {cert.courses.users.name}</p>
                  )}
                </div>

                <div className="h-px bg-[var(--color-canvas)]" />

                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-ink-muted)] font-semibold uppercase tracking-wide">Issued on</p>
                    <p className="text-sm text-[var(--color-ink)] mt-0.5">
                      {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-ink-muted)] font-semibold uppercase tracking-wide">Certificate ID</p>
                    <p className="font-mono text-sm font-bold text-[var(--color-accent)] mt-0.5">{cert.cert_number}</p>
                  </div>
                </div>

                <div className="bg-[var(--color-success-soft)] rounded-xl px-4 py-3 flex items-center gap-2 text-[var(--color-success)] text-sm font-semibold">
                  <CheckCircle size={16} weight="fill" /> This certificate is authentic
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
