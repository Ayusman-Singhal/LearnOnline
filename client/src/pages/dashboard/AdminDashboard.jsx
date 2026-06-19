import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, Student, ChartLineUp, ArrowRight } from '@phosphor-icons/react'
import { useUser } from '../../hooks/useUser'
import { useApi } from '../../hooks/useApi'
import { ease, dur, spring } from '../../lib/motion'
import { cn } from '../../lib/utils'

const ROLE_BADGE = {
  student:    'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  instructor: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  admin:      'bg-[var(--color-canvas)] text-[var(--color-ink-muted)] border border-[var(--color-border)]',
}

export default function AdminDashboard() {
  const { clerkUser } = useUser()
  const reduce = useReducedMotion()
  const api = useApi()
  const name = clerkUser?.firstName || 'Admin'

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'admin'],
    queryFn: () => api.get('/api/analytics/admin'),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/api/users'),
  })

  const recentUsers = users
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const stats = [
    { label: 'Users',       value: analytics?.total_users ?? '—',       icon: Users,        colorClass: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
    { label: 'Courses',     value: analytics?.published_courses ?? '—',  icon: BookOpen,     colorClass: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' },
    { label: 'Enrollments', value: analytics?.total_enrollments ?? '—',  icon: Student,      colorClass: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
    { label: 'Revenue',     value: analytics ? `₹${Number(analytics.platform_revenue).toLocaleString()}` : '—', icon: ChartLineUp, colorClass: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div>
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
          Platform overview
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">
          Welcome back, {name}. Here is what is happening.
        </p>
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

      {/* Recent users */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.slow, delay: 0.3, ease: ease.outExpo }}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-soft)]">
          <h2 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-[0.1em]">Recent users</h2>
          <Link
            to="/dashboard/users"
            className="text-xs text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent-hover)] flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={11} weight="bold" />
          </Link>
        </div>

        {recentUsers.length === 0 ? (
          <div className="px-5 py-10 text-center text-[var(--color-ink-muted)] text-sm">
            No users yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-canvas)] transition-colors"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[var(--color-ink-muted)]">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-ink)] text-sm">{user.name || 'Unnamed'}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] truncate">{user.email}</p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-bold capitalize flex-shrink-0 uppercase tracking-wider',
                  ROLE_BADGE[user.role] || ROLE_BADGE.student
                )}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
