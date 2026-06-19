import { ArrowRight, PencilSimple } from '@phosphor-icons/react'
import StaticLayout from '../components/layout/StaticLayout'

const POSTS = [
  {
    slug: 'how-to-pick-your-first-course',
    tag: 'Learning',
    title: 'How to pick your first online course (and actually finish it)',
    excerpt: 'Most people who drop out of online courses do so in the first week. Here is what separates learners who complete from those who do not.',
    date: 'Jun 10, 2026',
    readMins: 5,
  },
  {
    slug: 'instructors-earning-potential',
    tag: 'Instructors',
    title: 'What top instructors do differently to earn more',
    excerpt: 'We looked at our highest-earning instructors and found three habits that explain most of the gap. Course structure is not one of them.',
    date: 'Jun 3, 2026',
    readMins: 7,
  },
  {
    slug: 'certificates-that-matter',
    tag: 'Careers',
    title: 'Do online certificates actually matter to employers?',
    excerpt: 'Recruiters are split. We asked 40 hiring managers what they actually look for — and what signals competence better than a certificate.',
    date: 'May 27, 2026',
    readMins: 6,
  },
  {
    slug: 'building-learning-habit',
    tag: 'Productivity',
    title: 'Building a learning habit that sticks',
    excerpt: 'Motivation gets you started, systems keep you going. A practical guide to fitting online learning into a full schedule.',
    date: 'May 19, 2026',
    readMins: 4,
  },
]

const TAG_COLORS = {
  Learning: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  Instructors: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  Careers: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  Productivity: 'bg-amber-50 text-amber-700',
}

export default function BlogPage() {
  return (
    <StaticLayout>
      <div className="mb-12">
        <span className="inline-block text-xs font-bold text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Blog</span>
        <h1 className="text-4xl font-black text-[var(--color-ink)] tracking-tight mb-3">Ideas worth learning</h1>
        <p className="text-[var(--color-ink-muted)]">Insights on learning, teaching, and building a career in tech and design.</p>
      </div>

      <div className="space-y-4">
        {POSTS.map((post) => (
          <article
            key={post.slug}
            className="group bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 hover:border-[var(--color-border)] hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${TAG_COLORS[post.tag] || 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)]'}`}>
                {post.tag}
              </span>
              <span className="text-xs text-[var(--color-ink-muted)]">{post.date} · {post.readMins} min read</span>
            </div>
            <h2 className="font-black text-[var(--color-ink)] mb-2 text-lg leading-snug group-hover:text-[var(--color-accent)] transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{post.excerpt}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] transition-colors">
              Read more <ArrowRight size={14} weight="bold" className="transition-transform duration-150 group-hover:translate-x-0.5" />
            </div>
          </article>
        ))}
      </div>

      {/* More posts notice */}
      <div className="mt-10 flex flex-col items-center gap-3 py-10 border-t border-[var(--color-border-soft)] text-center">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-canvas)] flex items-center justify-center">
          <PencilSimple size={20} className="text-[var(--color-ink-muted)]" weight="fill" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-ink)]">More articles coming soon</p>
        <p className="text-xs text-[var(--color-ink-muted)]">We publish weekly on learning, teaching, and career growth.</p>
      </div>
    </StaticLayout>
  )
}
