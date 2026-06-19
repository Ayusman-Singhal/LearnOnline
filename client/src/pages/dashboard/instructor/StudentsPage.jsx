import { motion, useReducedMotion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlass, Users } from '@phosphor-icons/react'
import { useState } from 'react'
import { useApi } from '../../../hooks/useApi'

export default function InstructorStudentsPage() {
  const reduce = useReducedMotion()
  const api = useApi()
  const [search, setSearch] = useState('')

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['instructor', 'students'],
    queryFn: () => api.get('/api/enrollments/instructor'),
  })

  const filtered = enrollments.filter((e) => {
    const s = search.toLowerCase()
    return (
      e.users?.name?.toLowerCase().includes(s) ||
      e.users?.email?.toLowerCase().includes(s) ||
      e.courses?.title?.toLowerCase().includes(s)
    )
  })

  return (
    <div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">Students</h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">{enrollments.length} enrolled across all courses</p>
      </motion.div>

      <div className="relative max-w-sm mb-5">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
        <input
          type="search"
          placeholder="Search student or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
      >
        {isLoading ? (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[var(--color-canvas)]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-[var(--color-canvas)] rounded w-32" />
                  <div className="h-3 bg-[var(--color-canvas)] rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={32} className="text-[var(--color-border)] mx-auto mb-3" weight="fill" />
            <p className="text-[var(--color-ink-muted)] text-sm">
              {enrollments.length === 0 ? 'No students enrolled yet' : 'No results'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {filtered.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--color-canvas)] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--color-canvas)] flex items-center justify-center flex-shrink-0">
                  {enrollment.users?.avatar_url
                    ? <img src={enrollment.users.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    : <span className="text-xs font-bold text-[var(--color-ink-muted)]">{enrollment.users?.name?.[0] || '?'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-ink)] text-sm">{enrollment.users?.name || 'Unknown'}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] truncate">{enrollment.users?.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-[var(--color-ink-muted)] truncate max-w-[140px]">{enrollment.courses?.title}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {new Date(enrollment.enrolled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
