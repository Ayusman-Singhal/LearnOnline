import { CheckCircle, XCircle, Info } from '@phosphor-icons/react'
import StaticLayout from '../components/layout/StaticLayout'

const LAST_UPDATED = 'June 19, 2026'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-black text-[var(--color-ink)] mb-3">{title}</h2>
      <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

const ELIGIBLE = [
  'You have not accessed more than 20% of the course content',
  'Your request is within 7 days of purchase',
  'You have not downloaded any course materials',
  'You have not earned a certificate for the course',
]

const NOT_ELIGIBLE = [
  'Requests made more than 7 days after purchase',
  'Courses where more than 20% of content was accessed',
  'Courses where a certificate was already generated',
  'Free courses (no charge, no refund applicable)',
  'Coupon-discounted courses where the final price was ₹0',
]

export default function RefundPage() {
  return (
    <StaticLayout>
      <div className="mb-10">
        <span className="inline-block text-xs font-bold text-[var(--color-ink-muted)] bg-[var(--color-canvas)] px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Legal</span>
        <h1 className="text-4xl font-black text-[var(--color-ink)] tracking-tight mb-2">Refund Policy</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* TL;DR */}
      <div className="bg-[var(--color-accent-soft)] border border-[var(--color-accent-soft)] rounded-2xl p-5 mb-10 flex gap-3">
        <Info size={20} className="text-[var(--color-accent)] flex-shrink-0 mt-0.5" weight="fill" />
        <div>
          <p className="font-bold text-[var(--color-ink)] text-sm mb-1">Summary</p>
          <p className="text-sm text-[var(--color-ink)]">7-day refund window from purchase date, subject to usage limits below. Refunds are processed back to the original payment method within 5–10 business days.</p>
        </div>
      </div>

      <Section title="1. Refund window">
        <p>You may request a refund within <strong>7 calendar days</strong> of your purchase date. After 7 days, all sales are final.</p>
      </Section>

      <Section title="2. Eligible for refund">
        <div className="space-y-2">
          {ELIGIBLE.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle size={16} weight="fill" className="text-[var(--color-success)] flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="3. Not eligible for refund">
        <div className="space-y-2">
          {NOT_ELIGIBLE.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <XCircle size={16} weight="fill" className="text-red-400 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="4. How refunds work">
        <p>When a refund is approved, your enrollment is immediately revoked and access to the course is removed. The refund is processed via Stripe to your original payment method.</p>
        <p><strong>Timeline:</strong> Credit card refunds typically appear within 5–10 business days depending on your bank. UPI refunds are usually faster (1–3 business days).</p>
        <p><strong>Instructor payouts:</strong> When a refund is issued, the corresponding instructor payout is reversed. Instructors are not paid for refunded purchases.</p>
      </Section>

      <Section title="5. Coupons and partial payments">
        <p>If you used a coupon, the refund amount is the discounted price you actually paid not the original course price.</p>
      </Section>

      <Section title="6. How to request a refund">
        <p>Email <a href="mailto:support@learnonline.in" className="text-[var(--color-accent)] hover:opacity-80">support@learnonline.in</a> with your registered email address and the course name. We aim to respond within 2 business days.</p>
        <p>Include your order/payment ID from your enrollment confirmation email to speed up processing.</p>
      </Section>

      <Section title="7. Disputes">
        <p>If you believe a refund was incorrectly denied, you may escalate by replying to your refund decision email. We will review the case within 5 business days.</p>
        <p>LearnOnline reserves the right to decline refund requests that show signs of abuse (e.g. repeated refund requests across multiple courses).</p>
      </Section>

      <Section title="8. Contact">
        <p>Refund requests and questions: <a href="mailto:support@learnonline.in" className="text-[var(--color-accent)] hover:opacity-80">support@learnonline.in</a></p>
      </Section>
    </StaticLayout>
  )
}
