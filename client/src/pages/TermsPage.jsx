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

export default function TermsPage() {
  return (
    <StaticLayout>
      <div className="mb-10">
        <span className="inline-block text-xs font-bold text-[var(--color-ink-muted)] bg-[var(--color-canvas)] px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Legal</span>
        <h1 className="text-4xl font-black text-[var(--color-ink)] tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">Last updated: {LAST_UPDATED}</p>
      </div>

      <div>
        <Section title="1. Acceptance">
          <p>By creating an account or using LearnOnline, you agree to these Terms of Service. If you disagree with any part, do not use the platform.</p>
        </Section>

        <Section title="2. Accounts">
          <p>You are responsible for maintaining the security of your account credentials. You must provide accurate information and keep it up to date. One person may not maintain multiple accounts.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </Section>

        <Section title="3. Student terms">
          <p><strong>Enrollment:</strong> Upon successful payment (or free enrollment), you receive a non-exclusive, non-transferable licence to access the course content for personal learning purposes.</p>
          <p><strong>Prohibited use:</strong> You may not share your account, resell course access, download and redistribute content, or use course material for commercial purposes without instructor consent.</p>
          <p><strong>Certificates:</strong> Certificates are issued upon completing course requirements (all lessons and/or passing the quiz). Certificate integrity is verified via a public URL.</p>
        </Section>

        <Section title="4. Instructor terms">
          <p><strong>Content ownership:</strong> You retain ownership of content you upload. By publishing a course, you grant LearnOnline a non-exclusive licence to host, display, and distribute your content on the platform.</p>
          <p><strong>Content standards:</strong> You warrant that your content is original (or you have rights to it), does not infringe third-party intellectual property, and is accurate and legal.</p>
          <p><strong>Revenue share:</strong> Instructors receive 88% of each paid enrollment. The platform retains 12% as a service fee. Payouts are processed via Stripe Connect on Stripe's standard settlement schedule.</p>
          <p><strong>Prohibited content:</strong> No adult content, hate speech, misinformation, or content that promotes illegal activity.</p>
        </Section>

        <Section title="5. Payments">
          <p>All payments are processed by Stripe. Prices are displayed in INR. By completing a purchase, you authorise the charge to your payment method.</p>
          <p>For refund terms, see our <a href="/refund" className="text-[var(--color-accent)] hover:opacity-80">Refund Policy</a>.</p>
        </Section>

        <Section title="6. Intellectual property">
          <p>The LearnOnline platform, logo, and design are our intellectual property. Course content belongs to the respective instructors. You may not copy, modify, or redistribute platform or course materials without express permission.</p>
        </Section>

        <Section title="7. Prohibited conduct">
          <p>You may not: attempt to gain unauthorised access to any part of the platform, use automated tools to scrape content, interfere with platform operations, or engage in any fraudulent activity.</p>
        </Section>

        <Section title="8. Disclaimer">
          <p>Courses are provided "as is". LearnOnline makes no guarantees about learning outcomes, job placement, or the accuracy of course content. Instructors are independent creators, not employees of LearnOnline.</p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>To the maximum extent permitted by law, LearnOnline's total liability to you for any claim arising from these terms or your use of the platform shall not exceed the amount you paid in the 12 months preceding the claim.</p>
        </Section>

        <Section title="10. Governing law">
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.</p>
        </Section>

        <Section title="11. Changes">
          <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
        </Section>

        <Section title="12. Contact">
          <p>Questions about these terms: <a href="mailto:legal@learnonline.in" className="text-[var(--color-accent)] hover:opacity-80">legal@learnonline.in</a></p>
        </Section>
      </div>
    </StaticLayout>
  )
}
