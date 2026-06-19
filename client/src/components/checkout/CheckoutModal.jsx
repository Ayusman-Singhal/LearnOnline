import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useQueryClient } from '@tanstack/react-query'
import { X, Tag, Lock, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'
import { scaleIn, backdrop, ease, spring } from '../../lib/motion'
import { cn } from '../../lib/utils'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function PaymentStep({ course, finalAmount, onBack, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const api = useApi()
  const [paying, setPaying] = useState(false)

  const handlePay = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dashboard/my-courses` },
      redirect: 'if_required',
    })
    if (error) {
      toast.error(error.message)
      setPaying(false)
    } else if (paymentIntent?.status === 'succeeded') {
      try {
        await api.post('/api/orders/confirm', { payment_intent_id: paymentIntent.id, course_id: course.id })
      } catch {
        // webhook may have handled it; proceed
      }
      onSuccess()
    } else {
      toast.error('Payment incomplete. Try again.')
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="bg-[var(--color-canvas)] rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-ink-muted)]">Paying for</p>
          <p className="font-semibold text-[var(--color-ink)] text-sm mt-0.5">{course.title}</p>
        </div>
        <p className="text-lg font-black text-[var(--color-ink)] tabular-nums" style={{ fontFamily: 'var(--font-serif)' }}>
          ₹{finalAmount}
        </p>
      </div>

      <div className="min-h-[200px]">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={paying}
          className="flex-1 py-3 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)] disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={paying || !stripe}
          className={cn(
            'flex-1 py-3 rounded-xl text-white font-semibold text-sm',
            'bg-[var(--color-ink)] hover:bg-[#2A2520]',
            'disabled:opacity-50 active:scale-[0.98]',
            'flex items-center justify-center gap-2',
          )}
          style={{ transition: `all 180ms cubic-bezier(${ease.outExpo.join(',')})` }}
        >
          <Lock size={13} />
          {paying ? 'Processing…' : `Pay ₹${finalAmount}`}
        </button>
      </div>

      <p className="text-center text-xs text-[var(--color-ink-faint)] flex items-center justify-center gap-1">
        <Lock size={10} /> Secured by Stripe. Test: 4242 4242 4242 4242
      </p>
    </form>
  )
}

function SummaryStep({ course, onProceed }) {
  const api = useApi()
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponValid, setCouponValid] = useState(null)
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState(false)

  const finalAmount = Math.max(0, course.price - discount)

  const applyCoupon = async () => {
    if (!coupon.trim()) return
    setChecking(true)
    try {
      const res = await api.post('/api/orders/validate-coupon', { coupon_code: coupon, course_id: course.id })
      setDiscount(res.discount_amount)
      setCouponValid(true)
      toast.success(`Coupon applied ₹${res.discount_amount} off`)
    } catch (e) {
      setCouponValid(false)
      setDiscount(0)
      toast.error(e.message || 'Invalid coupon')
    } finally {
      setChecking(false)
    }
  }

  const handleProceed = async () => {
    setLoading(true)
    try {
      const data = await api.post('/api/orders', {
        course_id: course.id,
        coupon_code: couponValid ? coupon : undefined,
      })
      if (data.enrolled) {
        toast.success('Enrolled. Course is free.')
        onProceed({ enrolled: true })
      } else {
        onProceed({ clientSecret: data.client_secret, finalAmount: data.final_amount })
      }
    } catch (e) {
      toast.error(e.message || 'Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-[var(--color-canvas)] rounded-xl p-4 border border-[var(--color-border-soft)]">
        <p className="text-xs text-[var(--color-ink-muted)] mb-1">Enrolling in</p>
        <p className="font-semibold text-[var(--color-ink)]">{course.title}</p>
      </div>

      {/* Coupon */}
      <div>
        <label className="text-xs font-semibold text-[var(--color-ink)] mb-2 block">Coupon code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" aria-hidden />
            <input
              type="text"
              value={coupon}
              onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponValid(null); setDiscount(0) }}
              placeholder="e.g. SKILLINABOX"
              className={cn(
                'w-full pl-9 pr-3 h-10 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-[var(--color-surface)]',
                couponValid === true
                  ? 'border-[var(--color-success)] focus:ring-[var(--color-success)]/20'
                  : couponValid === false
                  ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
                  : 'border-[var(--color-border)] focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]',
              )}
            />
          </div>
          <button
            onClick={applyCoupon}
            disabled={checking || !coupon.trim()}
            className="px-4 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)] disabled:opacity-50 transition-colors"
          >
            {checking ? '…' : 'Apply'}
          </button>
        </div>
        {couponValid === true && (
          <p className="text-xs text-[var(--color-success)] mt-1.5 flex items-center gap-1">
            <CheckCircle size={11} weight="fill" /> Discount applied: −₹{discount}
          </p>
        )}
      </div>

      {/* Price breakdown */}
      <div className="border-t border-[var(--color-border-soft)] pt-4 space-y-2">
        <div className="flex justify-between text-sm text-[var(--color-ink-muted)]">
          <span>Original price</span>
          <span className="tabular-nums">₹{course.price}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-[var(--color-success)]">
            <span>Discount</span>
            <span className="tabular-nums">−₹{discount}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-[var(--color-ink)] text-base" style={{ fontFamily: 'var(--font-serif)' }}>
          <span>Total</span>
          <span className="tabular-nums">{finalAmount > 0 ? `₹${finalAmount}` : 'Free'}</span>
        </div>
      </div>

      <button
        onClick={handleProceed}
        disabled={loading}
        className={cn(
          'w-full h-11 rounded-xl text-white font-semibold text-sm',
          'bg-[var(--color-ink)] hover:bg-[#2A2520]',
          'disabled:opacity-50 active:scale-[0.98]',
        )}
        style={{ transition: `all 180ms cubic-bezier(${ease.outExpo.join(',')})` }}
      >
        {loading ? 'Loading…' : finalAmount === 0 ? 'Enroll for free' : 'Proceed to payment'}
      </button>
    </div>
  )
}

export default function CheckoutModal({ course, onClose }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const reduce = useReducedMotion()
  const [step, setStep] = useState('summary') // 'summary' | 'payment' | 'success'
  const [clientSecret, setClientSecret] = useState(null)
  const [finalAmount, setFinalAmount] = useState(course.price)

  const handleSummaryProceed = ({ enrolled, clientSecret: cs, finalAmount: fa }) => {
    if (enrolled) {
      qc.invalidateQueries({ queryKey: ['enrollments', 'my'] })
      setStep('success')
      return
    }
    setClientSecret(cs)
    setFinalAmount(fa)
    setStep('payment')
  }

  const handlePaymentSuccess = () => {
    qc.invalidateQueries({ queryKey: ['enrollments', 'my'] })
    setStep('success')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          variants={reduce ? {} : backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
          onClick={step !== 'success' ? onClose : undefined}
        />

        {/* Panel */}
        <motion.div
          key="panel"
          variants={reduce ? {} : scaleIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-[var(--color-surface)] rounded-2xl shadow-[0_24px_64px_rgba(26,23,20,0.18)] border border-[var(--color-border-soft)] w-full max-w-md p-6"
        >
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[var(--color-canvas)] flex items-center justify-center hover:bg-[var(--color-surface-dim)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              aria-label="Close"
            >
              <X size={14} className="text-[var(--color-ink-muted)]" />
            </button>
          )}

          <h2
            className="text-lg font-black text-[var(--color-ink)] mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {step === 'summary' && 'Enroll in course'}
            {step === 'payment' && 'Complete payment'}
            {step === 'success' && 'You\'re enrolled.'}
          </h2>

          {step === 'summary' && (
            <SummaryStep course={course} onProceed={handleSummaryProceed} />
          )}

          {step === 'payment' && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#B8553A',
                    colorText: '#1A1714',
                    colorBackground: '#FFFFFF',
                    borderRadius: '12px',
                  },
                },
              }}
            >
              <PaymentStep
                course={course}
                clientSecret={clientSecret}
                finalAmount={finalAmount}
                onBack={() => setStep('summary')}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-[var(--color-success-soft)] flex items-center justify-center mx-auto mb-5"
                initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring.bouncy }}
              >
                <CheckCircle size={32} weight="fill" className="text-[var(--color-success)]" />
              </motion.div>
              <p className="text-[var(--color-ink-muted)] text-sm mb-6 leading-relaxed">
                You now have full access to <strong className="text-[var(--color-ink)]">{course.title}</strong>. Start learning.
              </p>
              <button
                onClick={() => navigate('/dashboard/my-courses')}
                className={cn(
                  'w-full h-11 rounded-xl text-white font-semibold text-sm',
                  'bg-[var(--color-ink)] hover:bg-[#2A2520] active:scale-[0.98]',
                )}
                style={{ transition: `all 180ms cubic-bezier(${ease.outExpo.join(',')})` }}
              >
                Go to my courses
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
