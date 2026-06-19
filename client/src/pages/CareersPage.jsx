import { Briefcase, MapPin, ArrowRight, Rocket } from '@phosphor-icons/react'
import StaticLayout from '../components/layout/StaticLayout'

const ROLES = [
  {
    title: 'Full-Stack Engineer',
    type: 'Full-time',
    location: 'Remote (India)',
    team: 'Engineering',
    desc: 'Build and ship features across our React frontend and Node.js API. Own complete slices of the product end-to-end.',
  },
  {
    title: 'Curriculum Designer',
    type: 'Full-time',
    location: 'Remote (India)',
    team: 'Content',
    desc: 'Work with instructors to structure course content. Define quality standards, review outlines, and help instructors teach more clearly.',
  },
  {
    title: 'Growth Marketer',
    type: 'Full-time',
    location: 'Remote (India)',
    team: 'Marketing',
    desc: 'Own acquisition and retention across SEO, email, and paid channels. Data-first, experiment-often mentality required.',
  },
  {
    title: 'Instructor Success Manager',
    type: 'Part-time',
    location: 'Remote',
    team: 'Operations',
    desc: 'Onboard new instructors, help them publish their first course, and support them as they grow their student base.',
  },
]

const TEAM_COLORS = {
  Engineering: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  Content: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  Marketing: 'bg-amber-50 text-amber-700',
  Operations: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
}

export default function CareersPage() {
  return (
    <StaticLayout>
      <div className="mb-12">
        <span className="inline-block text-xs font-bold text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Careers</span>
        <h1 className="text-4xl font-black text-[var(--color-ink)] tracking-tight mb-3">Build the future of learning</h1>
        <p className="text-[var(--color-ink-muted)] leading-relaxed max-w-xl">
          We are a small, focused team. Everyone here ships. If you want to own large problems at an early-stage product, we should talk.
        </p>
      </div>

      {/* Why us */}
      <div className="bg-[var(--color-canvas)] rounded-2xl border border-[var(--color-border)] p-6 mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Rocket size={18} weight="fill" className="text-[var(--color-accent)]" />
          <p className="font-bold text-[var(--color-ink)]">Why LearnOnline</p>
        </div>
        <ul className="space-y-2 text-sm text-[var(--color-ink-muted)]">
          <li>· Fully remote work from anywhere in India</li>
          <li>· Equity for early team members</li>
          <li>· No micromanagement own your work end-to-end</li>
          <li>· ₹10,000/year learning budget for books, courses, conferences</li>
          <li>· Competitive salary benchmarked to market rates</li>
        </ul>
      </div>

      {/* Open roles */}
      <h2 className="text-xl font-black text-[var(--color-ink)] mb-5">Open positions</h2>
      <div className="space-y-4 mb-12">
        {ROLES.map((role) => (
          <div key={role.title} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${TEAM_COLORS[role.team] || 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)]'}`}>
                {role.team}
              </span>
              <span className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1">
                <Briefcase size={11} /> {role.type}
              </span>
              <span className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1">
                <MapPin size={11} /> {role.location}
              </span>
            </div>
            <h3 className="font-black text-[var(--color-ink)] mb-2">{role.title}</h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-4">{role.desc}</p>
            <a
              href={`mailto:careers@learnonline.in?subject=Application ${role.title}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              Apply via email <ArrowRight size={13} weight="bold" />
            </a>
          </div>
        ))}
      </div>

      {/* General */}
      <div className="bg-[var(--color-ink)] rounded-2xl p-8 text-center">
        <h2 className="text-xl font-black text-white mb-2">Don't see your role?</h2>
        <p className="text-white/70 text-sm mb-6">We occasionally hire for roles not listed. Send us what you are great at.</p>
        <a
          href="mailto:careers@learnonline.in?subject=General application"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-surface)] text-[var(--color-ink)] font-bold text-sm hover:bg-[var(--color-canvas)] transition-colors"
        >
          Get in touch <ArrowRight size={14} weight="bold" />
        </a>
      </div>
    </StaticLayout>
  )
}
