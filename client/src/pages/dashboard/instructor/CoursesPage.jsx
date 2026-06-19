import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpen, PencilSimple, Eye, EyeSlash, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApi } from '../../../hooks/useApi'

const STATUS_BADGE = {
  published: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  draft: 'bg-[var(--color-canvas)] text-[var(--color-ink-muted)]',
  archived: 'bg-red-50 text-red-400',
}

const EMPTY_FORM = { title: '', description: '', price: '', category_id: '' }

export default function InstructorCoursesPage() {
  const reduce = useReducedMotion()
  const api = useApi()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['instructor', 'courses'],
    queryFn: () => api.get('/api/courses/mine'),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories'),
  })

  const create = useMutation({
    mutationFn: () => api.post('/api/courses', { ...form, price: Number(form.price) }),
    onSuccess: (res) => {
      qc.invalidateQueries(['instructor', 'courses'])
      toast.success('Course created')
      setForm(EMPTY_FORM)
      setShowCreate(false)
    },
    onError: (e) => toast.error(e.message),
  })

  const togglePublish = useMutation({
    mutationFn: ({ id, status }) => api.put(`/api/courses/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries(['instructor', 'courses']); toast.success('Updated') },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">My courses</h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] active:scale-[0.97] transition-all"
          style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {showCreate ? <X size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
          {showCreate ? 'Cancel' : 'New course'}
        </button>
      </motion.div>

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 mb-5"
        >
          <p className="font-bold text-[var(--color-ink)] text-sm mb-4">New course</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              placeholder="Course title *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <input
              type="number"
              placeholder="Price (₹) *"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <textarea
              placeholder="Short description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
            />
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] h-fit"
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => create.mutate()}
              disabled={!form.title.trim() || !form.price || create.isPending}
              className="px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] transition-all"
              style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {create.isPending ? 'Creating...' : 'Create course'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Course list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-[var(--color-canvas)] rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--color-canvas)] rounded w-48" />
                <div className="h-3 bg-[var(--color-canvas)] rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={36} className="text-[var(--color-border)] mx-auto mb-3" weight="fill" />
          <p className="text-[var(--color-ink-muted)] font-medium">No courses yet</p>
          <p className="text-[var(--color-ink-muted)] text-sm mt-1">Create your first course above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 flex items-center gap-4 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                {course.thumbnail_url
                  ? <img src={course.thumbnail_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  : <BookOpen size={22} className="text-[var(--color-accent)]" weight="fill" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--color-ink)] text-sm truncate">{course.title}</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                  {course.categories?.name || 'Uncategorized'} &middot; &#8377;{course.price}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize flex-shrink-0 ${STATUS_BADGE[course.status]}`}>
                {course.status}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePublish.mutate({
                    id: course.id,
                    status: course.status === 'published' ? 'draft' : 'published',
                  })}
                  className="p-2 rounded-xl hover:bg-[var(--color-canvas)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                  title={course.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {course.status === 'published' ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
                <Link
                  to={`/dashboard/courses/${course.id}/edit`}
                  className="p-2 rounded-xl hover:bg-[var(--color-accent-soft)] text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] transition-colors"
                  title="Edit"
                >
                  <PencilSimple size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
