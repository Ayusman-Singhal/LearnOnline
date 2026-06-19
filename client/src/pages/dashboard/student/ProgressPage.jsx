import { motion, useReducedMotion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChartLineUp, Trophy, Play } from '@phosphor-icons/react'
import { useApi } from '../../../hooks/useApi'

function CourseProgressCard({ enrollment, index }) {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const course = enrollment.courses
  const progress = enrollment.progress_percent || 0
  const done = progress === 100

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5"
    >
      <div className="flex items-start gap-4 mb-4">
        {course?.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
            <BookOpen size={22} className="text-[var(--color-accent)]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[var(--color-ink)] text-sm leading-snug truncate">{course?.title || 'Course'}</p>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{course?.users?.name || 'Instructor'}</p>
          <div className="mt-2 flex items-center gap-2">
            {done ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-success)] bg-[var(--color-success-soft)] px-2 py-0.5 rounded-full">
                <Trophy size={10} weight="fill" /> Complete
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded-full">
                In progress
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-[var(--color-ink-muted)] mb-1.5">
          <span>Progress</span>
          <span className={done ? 'text-[var(--color-success)] font-semibold' : 'font-medium'}>{progress}%</span>
        </div>
        <div className="h-2 bg-[var(--color-canvas)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 + 0.2 }}
            className={`h-full rounded-full ${done ? 'bg-[var(--color-success)]' : 'bg-[var(--color-ink)]'}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
        <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <button
          onClick={() => navigate(`/dashboard/learn/${course?.id}`)}
          className="flex items-center gap-1 text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent)] transition-colors"
        >
          {done ? 'Review' : 'Continue'} <Play size={10} weight="fill" />
        </button>
      </div>
    </motion.div>
  )
}

export default function ProgressPage() {
  const reduce = useReducedMotion()
  const api = useApi()

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => api.get('/api/enrollments/my'),
  })

  const total = enrollments.length
  const completed = enrollments.filter((e) => e.progress_percent === 100).length
  const inProgress = enrollments.filter((e) => (e.progress_percent || 0) > 0 && e.progress_percent < 100).length
  const avgProgress = total ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / total) : 0

  const stats = [
    { label: 'Courses enrolled', value: total, color: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' },
    { label: 'Completed', value: completed, color: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
    { label: 'In progress', value: inProgress, color: 'bg-amber-50 text-amber-600' },
    { label: 'Avg progress', value: `${avgProgress}%`, color: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
  ]

  const sorted = [...enrollments].sort((a, b) => {
    if (a.progress_percent === 100 && b.progress_percent !== 100) return 1
    if (b.progress_percent === 100 && a.progress_percent !== 100) return -1
    return (b.progress_percent || 0) - (a.progress_percent || 0)
  })

  return (
    <div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">Learning progress</h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">Track your progress across all enrolled courses</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <ChartLineUp size={18} weight="fill" />
            </div>
            <div>
              <p className="text-xl font-black text-[var(--color-ink)]">{s.value}</p>
              <p className="text-[11px] text-[var(--color-ink-muted)]">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 animate-pulse space-y-3">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-[var(--color-canvas)] rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-[var(--color-canvas)] rounded" />
                  <div className="h-3 w-1/2 bg-[var(--color-canvas)] rounded" />
                </div>
              </div>
              <div className="h-2 bg-[var(--color-canvas)] rounded-full" />
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-16 text-center">
          <BookOpen size={32} className="text-[var(--color-border)] mx-auto mb-3" weight="fill" />
          <p className="font-semibold text-[var(--color-ink)] mb-1">No courses yet</p>
          <p className="text-sm text-[var(--color-ink-muted)]">Enroll in a course to start tracking progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map((e, i) => <CourseProgressCard key={e.id} enrollment={e} index={i} />)}
        </div>
      )}
    </div>
  )
}
