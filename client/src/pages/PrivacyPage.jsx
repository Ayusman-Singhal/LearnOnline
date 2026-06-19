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

export default function PrivacyPage() {
  return (
    <StaticLayout>
      <div className="mb-10">
        <span className="inline-block text-xs font-bold text-[var(--color-ink-muted)] bg-[var(--color-canvas)] px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Legal</span>
        <h1 className="text-4xl font-black text-[var(--color-ink)] tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose-like">
        <Section title="1. Who we are">
          <p>LearnOnline ("we", "us", or "our") operates the LearnOnline platform, an online learning marketplace. This Privacy Policy explains what personal data we collect, why, and how we use it.</p>
        </Section>

        <Section title="2. Data we collect">
          <p><strong>Account data:</strong> Name, email address, profile photo, and role (student or instructor) collected when you sign up via Clerk.</p>
          <p><strong>Payment data:</strong> Payments are processed by Stripe. We do not store card numbers. We retain transaction IDs, amounts, and enrollment records.</p>
          <p><strong>Usage data:</strong> Lesson progress, quiz attempts, certificates issued, and course enrollment history.</p>
          <p><strong>Instructor data:</strong> For instructors, we collect Stripe Connect account information for payout purposes.</p>
          <p><strong>Technical data:</strong> IP address, browser type, and device type collected automatically via server logs.</p>
        </Section>

        <Section title="3. How we use your data">
          <p>We use your data to: provide and improve the platform, process payments and issue payouts, send transactional emails (enrollment confirmations, certificates), track your learning progress, and comply with legal obligations.</p>
          <p>We do not sell your personal data to third parties.</p>
        </Section>

        <Section title="4. Data sharing">
          <p><strong>Stripe:</strong> Payment and payout processing. Governed by <a href="https://stripe.com/privacy" className="text-[var(--color-accent)] hover:opacity-80" target="_blank" rel="noopener noreferrer">Stripe's Privacy Policy</a>.</p>
          <p><strong>Clerk:</strong> Authentication and identity management. Governed by <a href="https://clerk.com/privacy" className="text-[var(--color-accent)] hover:opacity-80" target="_blank" rel="noopener noreferrer">Clerk's Privacy Policy</a>.</p>
          <p><strong>Cloudinary:</strong> Media storage for course content uploaded by instructors.</p>
          <p><strong>Resend:</strong> Transactional email delivery.</p>
          <p><strong>Supabase:</strong> Database hosting (PostgreSQL) on AWS infrastructure.</p>
        </Section>

        <Section title="5. Data retention">
          <p>We retain your account data for as long as your account is active. If you delete your account, we remove personal data within 30 days, except where retention is required by law (e.g. financial records for 7 years).</p>
        </Section>

        <Section title="6. Your rights">
          <p>You have the right to access, correct, or delete your personal data. To exercise these rights, email us at <a href="mailto:privacy@learnonline.in" className="text-[var(--color-accent)] hover:opacity-80">privacy@learnonline.in</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="7. Cookies">
          <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies.</p>
        </Section>

        <Section title="8. Security">
          <p>We use HTTPS everywhere, store passwords via Clerk (bcrypt hashed, never in our DB), and restrict database access to server-side processes using a service-role key that is never exposed to the browser.</p>
        </Section>

        <Section title="9. Children">
          <p>LearnOnline is not intended for users under 13. We do not knowingly collect data from children under 13. If you believe a child has provided us their data, contact us immediately.</p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>We may update this policy from time to time. We will notify registered users via email of any material changes. Continued use of the platform after changes constitutes acceptance.</p>
        </Section>

        <Section title="11. Contact">
          <p>For privacy questions: <a href="mailto:privacy@learnonline.in" className="text-[var(--color-accent)] hover:opacity-80">privacy@learnonline.in</a></p>
        </Section>
      </div>
    </StaticLayout>
  )
}
