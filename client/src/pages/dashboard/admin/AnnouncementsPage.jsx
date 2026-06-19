import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Trash, Plus, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApi } from '../../../hooks/useApi'

const TARGET_LABELS = { all: 'Everyone', student: 'Students', instructor: 'Instructors' }

export default function AnnouncementsPage() {
  const reduce = useReducedMotion()
  const api = useApi()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', target_role: 'all' })

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/api/announcements'),
  })

  const create = useMutation({
    mutationFn: () => api.post('/api/announcements', form),
    onSuccess: () => {
      qc.invalidateQueries(['announcements'])
      toast.success('Announcement published')
      setForm({ title: '', body: '', target_role: 'all' })
      setShowForm(false)
    },
    onError: (e) => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: (id) => api.del(`/api/announcements/${id}`),
    onSuccess: () => { qc.invalidateQueries(['announcements']); toast.success('Deleted') },
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
          <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">Announcements</h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-sm">Broadcast messages to users</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] active:scale-[0.97] transition-all"
          style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {showForm ? <X size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
          {showForm ? 'Cancel' : 'New'}
        </button>
      </motion.div>

      {/* Create form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 mb-5"
        >
          <p className="font-bold text-[var(--color-ink)] text-sm mb-4">New announcement</p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            <textarea
              placeholder="Message body..."
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
            />
            <div className="flex items-center gap-3">
              <select
                value={form.target_role}
                onChange={(e) => setForm((f) => ({ ...f, target_role: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="all">Everyone</option>
                <option value="student">Students only</option>
                <option value="instructor">Instructors only</option>
              </select>
              <button
                onClick={() => create.mutate()}
                disabled={!form.title.trim() || !form.body.trim() || create.isPending}
                className="px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] transition-all ml-auto"
                style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                {create.isPending ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 animate-pulse">
              <div className="h-4 bg-[var(--color-canvas)] rounded w-1/3 mb-2" />
              <div className="h-3 bg-[var(--color-canvas)] rounded w-2/3" />
            </div>
          ))
        ) : announcements.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone size={32} className="text-[var(--color-border)] mx-auto mb-3" weight="fill" />
            <p className="text-[var(--color-ink-muted)] text-sm">No announcements yet</p>
          </div>
        ) : (
          announcements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 group hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Megaphone size={18} className="text-amber-600" weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-[var(--color-ink)] text-sm">{a.title}</p>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-canvas)] text-[var(--color-ink-muted)] text-[10px] font-medium">
                      {TARGET_LABELS[a.target_role] || a.target_role}
                    </span>
                  </div>
                  <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">{a.body}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-2">
                    {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this announcement?')) remove.mutate(a.id)
                  }}
                  className="p-1.5 rounded-lg text-[var(--color-ink-faint)] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  aria-label="Delete"
                >
                  <Trash size={15} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
