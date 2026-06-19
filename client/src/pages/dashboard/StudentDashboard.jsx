import { motion, useReducedMotion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, ChartLineUp, Trophy, ArrowRight, Play } from '@phosphor-icons/react'
import { useUser } from '../../hooks/useUser'
import { useApi } from '../../hooks/useApi'
import { ease, dur, spring } from '../../lib/motion'
import { cn } from '../../lib/utils'

function StatCard({ label, value, icon: Icon, colorClass, index }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring.soft, delay: index * 0.07 }}
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 flex items-center gap-4"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
        <Icon size={18} weight="fill" />
      </div>
      <div>
        <p
          className="text-2xl font-black text-[var(--color-ink)] tabular-nums"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {value}
        </p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

export default function StudentDashboard() {
  const { clerkUser } = useUser()
  const reduce = useReducedMotion()
  const api = useApi()
  const navigate = useNavigate()
  const name = clerkUser?.firstName || 'there'

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => api.get('/api/enrollments/my'),
  })

  const total     = enrollments.length
  const completed = enrollments.filter((e) => e.progress_percent === 100).length
  const inProgress = enrollments.filter((e) => (e.progress_percent || 0) > 0 && e.progress_percent < 100).length

  const recent = enrollments
    .slice()
    .sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at))
    .slice(0, 3)

  const stats = [
    { label: 'Enrolled',    value: total,      icon: BookOpen,     colorClass: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' },
    { label: 'In progress', value: inProgress, icon: ChartLineUp,  colorClass: 'bg-amber-50 text-amber-600' },
    { label: 'Completed',   value: completed,  icon: Trophy,       colorClass: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
  ]

  return (
    <div>
      {/* Greeting */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.moderate, ease: ease.outExpo }}
        className="mb-8"
      >
        <h1
          className="text-2xl font-black text-[var(--color-ink)] tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}
        >
          Good day, {name}.
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">
          {total > 0 ? 'Pick up where you left off.' : 'Start your learning journey.'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
      </div>

      {/* Recent courses */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.slow, delay: 0.25, ease: ease.outExpo }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[var(--color-ink)] uppercase tracking-[0.1em]">
            My courses
          </h2>
          {total > 0 && (
            <Link
              to="/dashboard/my-courses"
              className="text-xs text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent-hover)] flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={11} weight="bold" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse">
                <div className="h-36 bg-[var(--color-border-soft)]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-[var(--color-border-soft)] rounded" />
                  <div className="h-3 w-1/2 bg-[var(--color-border-soft)] rounded" />
                  <div className="h-2 bg-[var(--color-border-soft)] rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : total === 0 ? (
          // Editorial empty state
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-12 text-center">
            <BookOpen size={28} className="text-[var(--color-border)] mx-auto mb-4" weight="fill" />
            <p
              className="font-black text-[var(--color-ink)] mb-1 text-lg"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              No courses yet.
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] mb-6">
              Browse hundreds of courses in design, tech, and business.
            </p>
            <Link
              to="/courses"
              className={cn(
                'group inline-flex items-center gap-2.5',
                'h-10 pl-5 pr-3 rounded-full',
                'bg-[var(--color-ink)] text-white text-sm font-semibold',
                'hover:bg-[#2A2520] active:scale-[0.97] transition-all'
              )}
              style={{ transition: `all 200ms cubic-bezier(${ease.outExpo.join(',')})` }}
            >
              Browse courses
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:scale-105 transition-transform">
                <ArrowRight size={11} weight="bold" />
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((enrollment, i) => {
              const course = enrollment.courses
              const progress = enrollment.progress_percent || 0
              return (
                <motion.div
                  key={enrollment.id}
                  initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring.soft, delay: 0.3 + i * 0.07 }}
                  className="group bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(26,23,20,0.07)] transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/dashboard/learn/${course.id}`)}
                  whileHover={{ y: -2, transition: { ...spring.snappy } }}
                >
                  <div className="relative">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-36 object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-36 bg-[var(--color-canvas)] flex items-center justify-center">
                        <BookOpen size={28} className="text-[var(--color-border)]" weight="fill" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-ink)]/20">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                        <Play size={16} weight="fill" className="text-[var(--color-ink)] ml-0.5" />
                      </div>
                    </div>
                    {progress === 100 && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[var(--color-success)] text-white text-[10px] font-bold uppercase tracking-wider">
                        Complete
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p
                      className="font-bold text-[var(--color-ink)] text-sm leading-snug mb-1 truncate"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {course.title}
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] mb-3">{course.users?.name || 'Instructor'}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-[var(--color-border-soft)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-accent)] rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--color-ink-muted)] font-medium w-7 text-right tabular-nums">{progress}%</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Discover banner */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.slow, delay: 0.45, ease: ease.outExpo }}
        className="mt-8 rounded-2xl bg-[var(--color-ink)] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
      >
        {/* Terracotta radial */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 10% 50%, rgba(184,85,58,0.2) 0%, transparent 55%)' }}
          aria-hidden
        />
        <div className="relative z-10">
          <p className="font-bold text-white text-[15px]" style={{ fontFamily: 'var(--font-serif)' }}>
            Discover new courses.
          </p>
          <p className="text-white/55 text-sm mt-0.5">
            Hundreds of courses in design, tech, and business.
          </p>
        </div>
        <Link
          to="/courses"
          className={cn(
            'group relative z-10 flex-shrink-0',
            'inline-flex items-center gap-2.5 h-9 pl-5 pr-3 rounded-full',
            'bg-[var(--color-accent)] text-white text-sm font-semibold',
            'hover:bg-[var(--color-accent-hover)] active:scale-[0.97]',
            'shadow-[0_2px_8px_rgba(184,85,58,0.3)]',
          )}
          style={{ transition: `all 200ms cubic-bezier(${ease.outExpo.join(',')})` }}
        >
          Browse
          <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 group-hover:scale-105 transition-transform">
            <ArrowRight size={10} weight="bold" />
          </span>
        </Link>
      </motion.div>
    </div>
  )
}
