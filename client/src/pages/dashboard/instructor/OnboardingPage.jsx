import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CheckCircle, ArrowSquareOut, Clock, Warning, PencilSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApi } from '../../../hooks/useApi'

function StatusBadge({ status }) {
  if (status === 'active') return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] text-sm font-semibold">
      <CheckCircle size={15} weight="fill" /> Active
    </span>
  )
  if (status === 'restricted') return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 text-sm font-semibold">
      <Warning size={15} weight="fill" /> Restricted
    </span>
  )
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold">
      <Clock size={15} weight="fill" /> Pending setup
    </span>
  )
}

export default function OnboardingPage() {
  const reduce = useReducedMotion()
  const api = useApi()
  const [searchParams] = useSearchParams()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['instructor', 'status'],
    queryFn: () => api.get('/api/instructor/status'),
  })

  // Refetch after returning from Stripe
  useEffect(() => {
    if (searchParams.get('success') === '1' || searchParams.get('refresh') === '1') {
      refetch()
      if (searchParams.get('success') === '1') toast.success('Onboarding submitted status will update shortly')
    }
  }, [])

  const startOnboard = useMutation({
    mutationFn: () => api.post('/api/instructor/onboard', {}),
    onSuccess: ({ url }) => { window.location.href = url },
    onError: (e) => toast.error(e.message),
  })

  const profile = data?.profile
  const stripeStatus = data?.stripeStatus
  const isActive = stripeStatus?.charges_enabled

  const steps = [
    {
      label: 'Account created',
      done: !!profile?.stripe_account_id,
      desc: 'Stripe Express account linked to your profile',
    },
    {
      label: 'Details submitted',
      done: stripeStatus?.details_submitted ?? false,
      desc: 'Business info and bank account provided to Stripe',
    },
    {
      label: 'Payments enabled',
      done: stripeStatus?.charges_enabled ?? false,
      desc: 'Ready to receive payouts from course enrollments',
    },
  ]

  return (
    <div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">Payments setup</h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">Connect your bank account to receive 88% of each enrollment.</p>
      </motion.div>

      <div className="max-w-xl space-y-4">
        {/* Status card */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-[var(--color-ink)] text-sm">Stripe Connect</p>
            {isLoading
              ? <div className="h-7 w-28 bg-[var(--color-canvas)] rounded-full animate-pulse" />
              : <StatusBadge status={profile?.stripe_onboard_status || 'pending'} />
            }
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  step.done ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'
                }`}>
                  {step.done
                    ? <CheckCircle size={14} weight="fill" className="text-white" />
                    : <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
                  }
                </div>
                <div>
                  <p className={`text-sm font-medium ${step.done ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'}`}>{step.label}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {isActive ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-success-soft)] border border-[var(--color-success-soft)]">
              <CheckCircle size={20} weight="fill" className="text-[var(--color-success)] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-success)]">You are ready to earn</p>
                <p className="text-xs text-[var(--color-success)] mt-0.5">Stripe will automatically transfer 88% of each enrollment to your bank account.</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => startOnboard.mutate()}
              disabled={startOnboard.isPending || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] disabled:opacity-50 active:scale-[0.97] transition-all"
              style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {startOnboard.isPending ? 'Opening Stripe...' : (
                <>
                  {profile?.stripe_account_id ? <PencilSimple size={15} weight="bold" /> : <ArrowSquareOut size={15} weight="bold" />}
                  {profile?.stripe_account_id ? 'Resume onboarding' : 'Set up payouts'}
                </>
              )}
            </button>
          )}
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[var(--color-canvas)] rounded-2xl border border-[var(--color-border)] p-5"
        >
          <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-3">How payouts work</p>
          <div className="space-y-2">
            {[
              ['88%', 'of each enrollment goes directly to your bank'],
              ['12%', 'platform fee retained by LearnOnline'],
              ['Automatic', 'Stripe transfers funds at payment capture no manual requests'],
              ['Test mode', 'Use Stripe test data no real money, no real KYC required'],
            ].map(([bold, rest]) => (
              <p key={bold} className="text-sm text-[var(--color-ink-muted)]">
                <span className="font-bold text-[var(--color-ink)]">{bold}</span> {rest}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
