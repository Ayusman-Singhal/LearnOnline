import { Link } from 'react-router-dom'
import { BookOpen, Users, Certificate, ArrowRight } from '@phosphor-icons/react'
import StaticLayout from '../components/layout/StaticLayout'

const STATS = [
  { label: 'Courses published', value: '50+' },
  { label: 'Active learners', value: '1,200+' },
  { label: 'Instructors', value: '30+' },
  { label: 'Certificates issued', value: '400+' },
]

const VALUES = [
  { icon: BookOpen, title: 'Learn at your pace', desc: 'No deadlines, no pressure. Start and finish on your own schedule with lifetime access to every course you enroll in.' },
  { icon: Users, title: 'Expert instructors', desc: 'Every course is built by practitioners people who have done the work and can teach it clearly.' },
  { icon: Certificate, title: 'Recognised certificates', desc: 'Verifiable PDF certificates with unique certificate IDs, shareable and publicly verifiable by anyone.' },
]

export default function AboutPage() {
  return (
    <StaticLayout>
      {/* Hero */}
      <div className="mb-14">
        <span className="inline-block text-xs font-bold text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-1 rounded-full mb-4 uppercase tracking-wide">About us</span>
        <h1 className="text-4xl font-black text-[var(--color-ink)] tracking-tight leading-tight mb-4">
          Learning that actually moves your career forward
        </h1>
        <p className="text-lg text-[var(--color-ink-muted)] leading-relaxed max-w-2xl">
          LearnOnline is a marketplace where working professionals teach what they know. We cut the fluff and focus on skills that matter the kind you can apply on Monday morning.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {STATS.map((s) => (
          <div key={s.label} className="bg-[var(--color-canvas)] rounded-2xl border border-[var(--color-border)] p-5 text-center">
            <p className="text-2xl font-black text-[var(--color-ink)]">{s.value}</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-[var(--color-ink)] mb-4">Our mission</h2>
        <p className="text-[var(--color-ink-muted)] leading-relaxed mb-4">
          We started LearnOnline because quality education was either too expensive, too slow, or too disconnected from what employers actually want. We believe anyone with drive and internet access should be able to learn a marketable skill in weeks, not years.
        </p>
        <p className="text-[var(--color-ink-muted)] leading-relaxed">
          Our platform is built for both sides of that equation learners who want to grow, and instructors who want to share what they have spent years figuring out. When instructors earn well, they create better courses. When students learn faster, they teach others. That flywheel is what we are building.
        </p>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-[var(--color-ink)] mb-6">What we stand for</h2>
        <div className="space-y-4">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                <Icon size={20} weight="fill" className="text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="font-bold text-[var(--color-ink)] mb-1">{title}</p>
                <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[var(--color-ink)] rounded-2xl p-8 text-center">
        <h2 className="text-xl font-black text-white mb-2">Ready to start learning?</h2>
        <p className="text-white/70 text-sm mb-6">Browse hundreds of courses taught by industry experts.</p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-surface)] text-[var(--color-accent)] font-bold text-sm hover:bg-[var(--color-accent-soft)] transition-colors"
        >
          Browse courses <ArrowRight size={15} weight="bold" />
        </Link>
      </div>
    </StaticLayout>
  )
}
