import { motion, useReducedMotion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { CurrencyInr, TrendUp, BookOpen, Users } from '@phosphor-icons/react'
import { useApi } from '../../../hooks/useApi'

export default function EarningsPage() {
  const reduce = useReducedMotion()
  const api = useApi()

  const { data, isLoading } = useQuery({
    queryKey: ['instructor', 'analytics'],
    queryFn: () => api.get('/api/analytics/instructor'),
  })

  const stats = [
    { label: 'Total earned', value: data ? `₹${data.total_earnings.toLocaleString('en-IN')}` : '—', icon: CurrencyInr, color: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
    { label: 'Total students', value: data?.total_students ?? '—', icon: Users, color: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' },
    { label: 'Published courses', value: data?.courses?.filter((c) => c.status === 'published').length ?? '—', icon: BookOpen, color: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
    { label: 'Avg per course', value: data?.courses?.length ? `₹${Math.round(data.total_earnings / data.courses.length).toLocaleString('en-IN')}` : '—', icon: TrendUp, color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">Earnings</h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">Your 88% share from each enrollment</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={20} weight="fill" />
              </div>
              {isLoading
                ? <div className="h-7 bg-[var(--color-canvas)] rounded-lg w-20 animate-pulse mb-1" />
                : <p className="text-2xl font-black text-[var(--color-ink)]">{stat.value}</p>
              }
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Per-course breakdown */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[var(--color-border-soft)]">
          <p className="font-bold text-[var(--color-ink)] text-sm">Course breakdown</p>
        </div>
        {isLoading ? (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                <div className="flex-1 h-3.5 bg-[var(--color-canvas)] rounded w-32" />
                <div className="h-3.5 bg-[var(--color-canvas)] rounded w-16" />
              </div>
            ))}
          </div>
        ) : !data?.courses?.length ? (
          <p className="text-center text-[var(--color-ink-muted)] text-sm py-10">No courses yet</p>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {data.courses.map((course) => {
              const courseEnrollments = data.enrollments_by_course?.filter((e) => e.course_id === course.id) || []
              return (
                <div key={course.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-canvas)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)] truncate">{course.title}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">{courseEnrollments.length} students</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                    course.status === 'published' ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' : 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)]'
                  }`}>
                    {course.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
