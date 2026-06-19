import { motion, useReducedMotion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Users, Wallet, ChartLineUp, Plus, ArrowRight } from '@phosphor-icons/react'
import { useUser } from '../../hooks/useUser'
import { useApi } from '../../hooks/useApi'
import { ease, dur, spring } from '../../lib/motion'
import { cn } from '../../lib/utils'

export default function InstructorDashboard() {
  const { clerkUser } = useUser()
  const reduce = useReducedMotion()
  const api = useApi()
  const navigate = useNavigate()
  const name = clerkUser?.firstName || 'there'

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['instructor', 'courses'],
    queryFn: () => api.get('/api/courses/mine'),
  })

  const { data: analytics } = useQuery({
    queryKey: ['instructor', 'analytics'],
    queryFn: () => api.get('/api/analytics/instructor'),
  })

  const published      = courses.filter((c) => c.status === 'published').length
  const totalStudents  = analytics?.total_students || 0
  const totalEarnings  = analytics?.total_earnings || 0

  const stats = [
    { label: 'Published',  value: published,                            icon: BookOpen,    colorClass: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' },
    { label: 'Students',   value: totalStudents,                        icon: Users,       colorClass: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
    { label: 'Earnings',   value: `₹${totalEarnings.toLocaleString()}`, icon: Wallet,      colorClass: 'bg-amber-50 text-amber-600' },
    { label: 'All courses',value: courses.length,                       icon: ChartLineUp, colorClass: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' },
  ]

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.moderate, ease: ease.outExpo }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1
            className="text-2xl font-black text-[var(--color-ink)] tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}
          >
            Welcome, {name}.
          </h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-sm">
            Here is how your courses are performing.
          </p>
        </div>
        <Link
          to="/dashboard/courses"
          className={cn(
            'group inline-flex items-center gap-2.5 h-10 pl-5 pr-3 rounded-full flex-shrink-0',
            'bg-[var(--color-ink)] text-white text-sm font-semibold',
            'hover:bg-[#2A2520] active:scale-[0.97]',
          )}
          style={{ transition: `all 200ms cubic-bezier(${ease.outExpo.join(',')})` }}
        >
          <Plus size={14} weight="bold" />
          New course
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring.soft, delay: i * 0.07 }}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5"
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', stat.colorClass)}>
                <Icon size={17} weight="fill" />
              </div>
              <p
                className="text-2xl font-black text-[var(--color-ink)] tabular-nums"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Courses table */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.slow, delay: 0.3, ease: ease.outExpo }}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-soft)]">
          <h2 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-[0.1em]">My courses</h2>
          <Link
            to="/dashboard/courses"
            className="text-xs text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent-hover)] flex items-center gap-1 transition-colors"
          >
            Manage all <ArrowRight size={11} weight="bold" />
          </Link>
        </div>

        {coursesLoading ? (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-48 bg-[var(--color-border-soft)] rounded" />
                  <div className="h-3 w-24 bg-[var(--color-border-soft)] rounded" />
                </div>
                <div className="h-5 w-16 bg-[var(--color-border-soft)] rounded-md" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <BookOpen size={24} className="text-[var(--color-border)] mx-auto mb-3" weight="fill" />
            <p
              className="font-black text-[var(--color-ink)] mb-1"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              No courses yet.
            </p>
            <p className="text-sm text-[var(--color-ink-muted)]">Create your first course to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {courses.map((course) => {
              const count = analytics?.enrollments_by_course?.filter((e) => e.course_id === course.id).length || 0
              return (
                <div
                  key={course.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--color-canvas)] transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/courses/${course.id}/edit`)}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-[var(--color-ink)] text-sm truncate"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {course.title}
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 tabular-nums">
                      {count} student{count !== 1 ? 's' : ''} · ₹{course.price}
                    </p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-bold capitalize flex-shrink-0 uppercase tracking-wider',
                    course.status === 'published' ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' :
                    course.status === 'draft'     ? 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)] border border-[var(--color-border)]' :
                                                    'bg-[var(--color-error-soft)] text-[var(--color-error)]',
                  )}>
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
