import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlass, Funnel, Star, ArrowRight } from '@phosphor-icons/react'
import Footer from '../components/layout/Footer'
import { ease, dur } from '../lib/motion'
import { cn } from '../lib/utils'

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-5 h-px bg-[var(--color-accent)]" aria-hidden />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
        {children}
      </span>
    </div>
  )
}

function CourseCard({ course, index }) {
  const reduce = useReducedMotion()
  const instructor = course.users?.name || course.instructor_name || 'Instructor'
  const category = course.categories?.name || 'General'
  const img = course.thumbnail_url || `https://picsum.photos/seed/${course.id}/400/225`

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: dur.slow, delay: index * 0.04, ease: ease.outExpo }}
      className="group bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-[0_4px_20px_rgba(26,23,20,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={img}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          loading="lazy"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-bold text-[var(--color-ink)] text-sm leading-snug mb-1 flex-1"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {course.title}
        </h3>
        <p className="text-xs text-[var(--color-ink-muted)] mb-3">{instructor}</p>

        {course.avg_rating != null && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star size={12} weight="fill" className="text-amber-500" />
            <span className="text-xs font-semibold text-[var(--color-ink)] tabular-nums">
              {Number(course.avg_rating).toFixed(1)}
            </span>
            {course.enrollment_count > 0 && (
              <span className="text-xs text-[var(--color-ink-faint)] tabular-nums">
                ({course.enrollment_count.toLocaleString()})
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-soft)]">
          <span className="text-base font-extrabold text-[var(--color-ink)] tabular-nums">
            {course.price > 0 ? `₹${course.price}` : 'Free'}
          </span>
          <Link
            to={`/courses/${course.id}`}
            className="group/link inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            aria-label={`View ${course.title}`}
          >
            View course
            <ArrowRight
              size={11}
              weight="bold"
              className="transition-transform duration-150 group-hover/link:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-[var(--color-border-soft)]" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 bg-[var(--color-border-soft)] rounded" />
        <div className="h-4 w-3/4 bg-[var(--color-border-soft)] rounded" />
        <div className="h-3 w-1/2 bg-[var(--color-border-soft)] rounded" />
        <div className="h-8 bg-[var(--color-border-soft)] rounded mt-4" />
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', 'public'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses`)
      if (!res.ok) throw new Error('Failed to fetch courses')
      return res.json()
    },
    staleTime: 60_000,
  })

  const categories = ['All', ...Array.from(new Set(courses.map((c) => c.categories?.name).filter(Boolean)))]

  const filtered = courses.filter((c) => {
    const matchCat = category === 'All' || c.categories?.name === category
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.users?.name || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-[100dvh] bg-[var(--color-canvas)]">
      {/* Header */}
      <div className="pt-28 pb-10 px-4 md:px-6 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: dur.moderate, ease: ease.outExpo }}
          >
            <SectionLabel>Catalog</SectionLabel>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.slow, delay: 0.05, ease: ease.outExpo }}
            className="text-4xl font-black tracking-tight text-[var(--color-ink)] mb-2"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.025em' }}
          >
            Browse courses
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.slow, delay: 0.09, ease: ease.outExpo }}
            className="text-[var(--color-ink-muted)] mb-6"
          >
            {isLoading ? 'Loading courses…' : `${courses.length} courses in design, tech, and business.`}
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.slow, delay: 0.12, ease: ease.outExpo }}
            className="relative max-w-md"
          >
            <MagnifyingGlass
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search courses or instructors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 h-10 rounded-xl text-sm',
                'border border-[var(--color-border)] bg-[var(--color-canvas)]',
                'text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]',
                'transition-all duration-150'
              )}
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Category filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <Funnel size={15} className="text-[var(--color-ink-faint)] flex-shrink-0" aria-hidden />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all duration-150',
                category === cat
                  ? 'bg-[var(--color-ink)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)] border border-[var(--color-border)] hover:border-[var(--color-ink-faint)] hover:text-[var(--color-ink)]'
              )}
              style={{ transition: `all 150ms cubic-bezier(${ease.outExpo.join(',')})` }}
            >
              {cat}
            </button>
          ))}
        </div>

        {!isLoading && (
          <p className="text-xs text-[var(--color-ink-muted)] mb-6 tabular-nums">
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-[var(--color-border-soft)] rounded-2xl bg-[var(--color-surface)]">
            <p
              className="text-2xl font-black text-[var(--color-border)] mb-2"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Nothing here.
            </p>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Try a different search term or category.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
