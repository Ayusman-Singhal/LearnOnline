import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, MagnifyingGlass, Archive } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApi } from '../../../hooks/useApi'

const STATUS_BADGE = {
  published: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  draft: 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)]',
  archived: 'bg-red-50 text-red-400',
}

export default function CoursesAdminPage() {
  const reduce = useReducedMotion()
  const api = useApi()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => api.get('/api/courses/admin/all'),
  })

  const archive = useMutation({
    mutationFn: (id) => api.patch(`/api/courses/${id}/archive`, {}),
    onSuccess: () => { qc.invalidateQueries(['admin', 'courses']); toast.success('Course archived') },
    onError: (e) => toast.error(e.message),
  })

  const filtered = courses.filter((c) => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.users?.name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">Courses</h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">{courses.length} total courses</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
          <input
            type="search"
            placeholder="Search title or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'published', 'draft', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all',
                statusFilter === s ? 'bg-[var(--color-ink)] text-white' : 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)] hover:bg-[var(--color-border)]',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
      >
        {isLoading ? (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-10 h-10 bg-[var(--color-canvas)] rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-[var(--color-canvas)] rounded w-48" />
                  <div className="h-3 bg-[var(--color-canvas)] rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={32} className="text-[var(--color-border)] mx-auto mb-3" weight="fill" />
            <p className="text-[var(--color-ink-muted)] text-sm">No courses found</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {filtered.map((course) => (
              <div key={course.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-canvas)] transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    : <BookOpen size={18} className="text-[var(--color-accent)]" weight="fill" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-ink)] text-sm truncate">{course.title}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] truncate">
                    {course.users?.name || 'Unknown instructor'} &middot; {course.categories?.name || 'Uncategorized'}
                  </p>
                </div>
                <span className="text-sm font-bold text-[var(--color-ink)]">&#8377;{course.price}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_BADGE[course.status]}`}>
                  {course.status}
                </span>
                {course.status !== 'archived' && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Archive "${course.title}"?`)) archive.mutate(course.id)
                    }}
                    className="p-1.5 rounded-lg text-[var(--color-ink-faint)] hover:text-amber-500 hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    aria-label="Archive"
                  >
                    <Archive size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
