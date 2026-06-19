import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash, CheckCircle, Circle, PencilSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApi } from '../../../hooks/useApi'

const TABS = ['Details', 'Lessons', 'Quiz']
const LESSON_TYPES = ['video', 'pdf', 'image', 'text']

export default function CourseEditPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const api = useApi()
  const qc = useQueryClient()
  const [tab, setTab] = useState('Details')

  // ─── Course data ───────────────────────────────────────────────────────
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get(`/api/courses/${courseId}`),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories'),
  })

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => api.get(`/api/lessons/course/${courseId}`),
  })

  const { data: quiz } = useQuery({
    queryKey: ['quiz', courseId],
    queryFn: () => api.get(`/api/quizzes/course/${courseId}`),
  })

  // ─── Details form ──────────────────────────────────────────────────────
  const [details, setDetails] = useState(null)
  const detailsForm = details ?? {
    title: course?.title || '',
    description: course?.description || '',
    price: course?.price || '',
    category_id: course?.category_id || '',
    thumbnail_url: course?.thumbnail_url || '',
  }

  const saveDetails = useMutation({
    mutationFn: () => api.put(`/api/courses/${courseId}`, {
      ...detailsForm,
      price: Number(detailsForm.price),
    }),
    onSuccess: () => { qc.invalidateQueries(['course', courseId]); toast.success('Saved') },
    onError: (e) => toast.error(e.message),
  })

  // ─── Lesson form ───────────────────────────────────────────────────────
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'video', content_url: '', is_free: false, duration_mins: '' })
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null) // lesson object being edited
  const [uploading, setUploading] = useState(false)
  const [thumbnailImporting, setThumbnailImporting] = useState(false)

  const importThumbnailUrl = async () => {
    const url = detailsForm.thumbnail_url?.trim()
    if (!url?.startsWith('http')) return toast.error('Enter a valid URL first')
    setThumbnailImporting(true)
    try {
      const result = await api.post('/api/uploads/from-url', {
        url,
        folder: `learnonline/thumbnails/courses/${courseId}`,
      })
      setDetails((d) => ({ ...detailsForm, ...d, thumbnail_url: result.url }))
      toast.success('Thumbnail saved to Cloudinary')
    } catch (e) {
      toast.error(e.message || 'Failed to import thumbnail')
    } finally {
      setThumbnailImporting(false)
    }
  }

  const uploadThumbnailFile = async (file) => {
    if (!file) return
    setThumbnailImporting(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'image')
      fd.append('folder', `learnonline/thumbnails/courses/${courseId}`)
      const result = await api.post('/api/uploads', fd)
      setDetails((d) => ({ ...detailsForm, ...d, thumbnail_url: result.url }))
      toast.success('Thumbnail uploaded')
    } catch (e) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setThumbnailImporting(false)
    }
  }

  const uploadContent = async (file, type, setForm) => {
    setUploading(true)
    try {
      const folder = `learnonline/${type === 'video' ? 'videos' : type === 'pdf' ? 'pdfs' : 'images'}/courses/${courseId}`
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type === 'pdf' ? 'pdf' : type === 'video' ? 'video' : 'image')
      fd.append('folder', folder)
      const result = await api.post('/api/uploads', fd)
      setForm((f) => ({ ...f, content_url: result.url }))
      toast.success('File uploaded')
    } catch (e) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const addLesson = useMutation({
    mutationFn: () => api.post('/api/lessons', {
      ...lessonForm,
      course_id: courseId,
      sort_order: lessons.length,
      duration_mins: lessonForm.duration_mins ? Number(lessonForm.duration_mins) : null,
    }),
    onSuccess: () => {
      qc.invalidateQueries(['lessons', courseId])
      toast.success('Lesson added')
      setLessonForm({ title: '', type: 'video', content_url: '', is_free: false, duration_mins: '' })
      setShowLessonForm(false)
    },
    onError: (e) => toast.error(e.message),
  })

  const deleteLesson = useMutation({
    mutationFn: (id) => api.del(`/api/lessons/${id}`),
    onSuccess: () => { qc.invalidateQueries(['lessons', courseId]); toast.success('Lesson removed') },
    onError: (e) => toast.error(e.message),
  })

  const updateLesson = useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/api/lessons/${id}`, {
      ...body,
      duration_mins: body.duration_mins ? Number(body.duration_mins) : null,
    }),
    onSuccess: () => {
      qc.invalidateQueries(['lessons', courseId])
      toast.success('Lesson updated')
      setEditingLesson(null)
    },
    onError: (e) => toast.error(e.message),
  })

  // ─── Quiz ──────────────────────────────────────────────────────────────
  const [quizForm, setQuizForm] = useState({ title: '', passing_score: 70, allow_retry: true })
  const [qForm, setQForm] = useState({ question: '', options: ['', '', '', ''], correct_index: 0 })

  const createQuiz = useMutation({
    mutationFn: () => api.post('/api/quizzes', { ...quizForm, course_id: courseId }),
    onSuccess: () => { qc.invalidateQueries(['quiz', courseId]); toast.success('Quiz created') },
    onError: (e) => toast.error(e.message),
  })

  const addQuestion = useMutation({
    mutationFn: () => api.post(`/api/quizzes/${quiz.id}/questions`, {
      question: qForm.question,
      options: qForm.options.filter((o) => o.trim()),
      correct_index: qForm.correct_index,
      sort_order: quiz.questions?.length ?? 0,
    }),
    onSuccess: () => {
      qc.invalidateQueries(['quiz', courseId])
      toast.success('Question added')
      setQForm({ question: '', options: ['', '', '', ''], correct_index: 0 })
    },
    onError: (e) => toast.error(e.message),
  })

  const deleteQuestion = useMutation({
    mutationFn: (qId) => api.del(`/api/quizzes/${quiz.id}/questions/${qId}`),
    onSuccess: () => { qc.invalidateQueries(['quiz', courseId]); toast.success('Question removed') },
    onError: (e) => toast.error(e.message),
  })

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/dashboard/courses')}
          className="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors mb-3"
        >
          <ArrowLeft size={14} weight="bold" /> Back to courses
        </button>
        <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight truncate">{course?.title}</h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm capitalize">{course?.status}</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--color-canvas)] p-1 rounded-xl mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === t ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]',
            ].join(' ')}
            style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Details tab ── */}
      {tab === 'Details' && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 max-w-2xl space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-1 block">Title</label>
              <input
                value={detailsForm.title}
                onChange={(e) => setDetails((d) => ({ ...detailsForm, ...d, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-1 block">Description</label>
              <textarea
                value={detailsForm.description}
                onChange={(e) => setDetails((d) => ({ ...detailsForm, ...d, description: e.target.value }))}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-1 block">Price (&#8377;)</label>
              <input
                type="number"
                value={detailsForm.price}
                onChange={(e) => setDetails((d) => ({ ...detailsForm, ...d, price: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-1 block">Category</label>
              <select
                value={detailsForm.category_id}
                onChange={(e) => setDetails((d) => ({ ...detailsForm, ...d, category_id: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-1.5 block">Thumbnail</label>
              {detailsForm.thumbnail_url && (
                <img
                  src={detailsForm.thumbnail_url}
                  alt="Thumbnail preview"
                  className="w-full max-h-40 object-cover rounded-xl mb-2 border border-[var(--color-border)]"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
              <div className="flex gap-2 mb-2">
                <input
                  value={detailsForm.thumbnail_url}
                  onChange={(e) => setDetails((d) => ({ ...detailsForm, ...d, thumbnail_url: e.target.value }))}
                  placeholder="Paste image URL…"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <button
                  type="button"
                  onClick={importThumbnailUrl}
                  disabled={thumbnailImporting}
                  className="px-3 py-2 rounded-xl bg-[var(--color-surface-dim)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-canvas)] disabled:opacity-50 transition-colors whitespace-nowrap"
                  title="Download URL and save to Cloudinary"
                >
                  {thumbnailImporting ? 'Saving…' : 'Save to Cloudinary'}
                </button>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadThumbnailFile(e.target.files[0])}
                  disabled={thumbnailImporting}
                />
                {thumbnailImporting ? 'Uploading…' : 'Or upload from device'}
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => saveDetails.mutate()}
              disabled={saveDetails.isPending}
              className="px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] disabled:opacity-50 active:scale-[0.97] transition-all"
              style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {saveDetails.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Lessons tab ── */}
      {tab === 'Lessons' && (
        <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-[var(--color-ink-muted)]">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => setShowLessonForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] active:scale-[0.97] transition-all"
              style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <Plus size={14} weight="bold" /> Add lesson
            </button>
          </div>

          {/* Add lesson form */}
          {showLessonForm && (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Lesson title *"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <select
                  value={lessonForm.type}
                  onChange={(e) => setLessonForm((f) => ({ ...f, type: e.target.value, content_url: '' }))}
                  className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  {LESSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>

                {/* Content field — type-aware */}
                {lessonForm.type === 'text' ? (
                  <textarea
                    placeholder="Paste or type lesson content..."
                    value={lessonForm.content_url}
                    onChange={(e) => setLessonForm((f) => ({ ...f, content_url: e.target.value }))}
                    rows={4}
                    className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-y"
                  />
                ) : lessonForm.type === 'video' ? (
                  <div className="sm:col-span-2 space-y-2">
                    <input
                      placeholder="YouTube / Vimeo URL"
                      value={lessonForm.content_url}
                      onChange={(e) => setLessonForm((f) => ({ ...f, content_url: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                    <label className={['flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-ink-muted)] cursor-pointer hover:bg-[var(--color-canvas)]', uploading ? 'opacity-50 pointer-events-none' : ''].join(' ')}>
                      <Plus size={14} /> {uploading ? 'Uploading...' : 'Or upload video file'}
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && uploadContent(e.target.files[0], 'video', setLessonForm)} />
                    </label>
                    {lessonForm.content_url && !lessonForm.content_url.startsWith('http') === false && lessonForm.content_url.startsWith('https://res.cloudinary') && (
                      <p className="text-xs text-[var(--color-success)]">Uploaded ✓</p>
                    )}
                  </div>
                ) : (
                  <label className={['sm:col-span-2 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[var(--color-border)] text-sm cursor-pointer hover:bg-[var(--color-canvas)]', uploading ? 'opacity-50 pointer-events-none' : lessonForm.content_url ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'text-[var(--color-ink-muted)]'].join(' ')}>
                    <Plus size={14} />
                    {uploading ? 'Uploading...' : lessonForm.content_url ? `Uploaded ✓` : `Upload ${lessonForm.type} file`}
                    <input type="file" accept={lessonForm.type === 'pdf' ? '.pdf' : 'image/*'} className="hidden"
                      onChange={(e) => e.target.files[0] && uploadContent(e.target.files[0], lessonForm.type, setLessonForm)} />
                  </label>
                )}

                <input
                  type="number"
                  placeholder="Duration (mins)"
                  value={lessonForm.duration_mins}
                  onChange={(e) => setLessonForm((f) => ({ ...f, duration_mins: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonForm.is_free}
                    onChange={(e) => setLessonForm((f) => ({ ...f, is_free: e.target.checked }))}
                    className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                  <span className="text-sm text-[var(--color-ink-muted)]">Free preview</span>
                </label>
                <button
                  onClick={() => addLesson.mutate()}
                  disabled={!lessonForm.title.trim() || addLesson.isPending}
                  className="px-3 py-1.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] disabled:opacity-50 active:scale-[0.97] transition-all"
                  style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  {addLesson.isPending ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          )}

          {/* Lessons list */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            {lessonsLoading ? (
              <div className="p-8 text-center text-[var(--color-ink-muted)] text-sm animate-pulse">Loading...</div>
            ) : lessons.length === 0 ? (
              <div className="p-10 text-center text-[var(--color-ink-muted)] text-sm">No lessons yet. Add the first one.</div>
            ) : (
              <div className="divide-y divide-[var(--color-border-soft)]">
                {lessons.map((lesson, i) => {
                  const isEditing = editingLesson?.id === lesson.id
                  if (isEditing) {
                    return (
                      <div key={lesson.id} className="px-4 py-3 bg-[var(--color-accent-soft)] space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            value={editingLesson.title}
                            onChange={(e) => setEditingLesson((l) => ({ ...l, title: e.target.value }))}
                            placeholder="Title"
                            className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                          />
                          <select
                            value={editingLesson.type}
                            onChange={(e) => setEditingLesson((l) => ({ ...l, type: e.target.value, content_url: '' }))}
                            className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                          >
                            {LESSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>

                          {/* Content field — type-aware */}
                          {editingLesson.type === 'text' ? (
                            <textarea
                              placeholder="Paste or type lesson content..."
                              value={editingLesson.content_url || ''}
                              onChange={(e) => setEditingLesson((l) => ({ ...l, content_url: e.target.value }))}
                              rows={3}
                              className="sm:col-span-2 px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-y"
                            />
                          ) : editingLesson.type === 'video' ? (
                            <div className="sm:col-span-2 space-y-2">
                              <input
                                value={editingLesson.content_url || ''}
                                onChange={(e) => setEditingLesson((l) => ({ ...l, content_url: e.target.value }))}
                                placeholder="YouTube / Vimeo URL"
                                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                              />
                              <label className={['flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-ink-muted)] cursor-pointer hover:bg-[var(--color-surface)]', uploading ? 'opacity-50 pointer-events-none' : ''].join(' ')}>
                                <Plus size={12} /> {uploading ? 'Uploading...' : 'Or upload video file'}
                                <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && uploadContent(e.target.files[0], 'video', setEditingLesson)} />
                              </label>
                            </div>
                          ) : (
                            <label className={['sm:col-span-2 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[var(--color-border)] text-xs cursor-pointer hover:bg-[var(--color-surface)]', uploading ? 'opacity-50 pointer-events-none' : editingLesson.content_url ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'text-[var(--color-ink-muted)]'].join(' ')}>
                              <Plus size={12} />
                              {uploading ? 'Uploading...' : editingLesson.content_url ? 'Uploaded ✓ (click to replace)' : `Upload ${editingLesson.type} file`}
                              <input type="file" accept={editingLesson.type === 'pdf' ? '.pdf' : 'image/*'} className="hidden"
                                onChange={(e) => e.target.files[0] && uploadContent(e.target.files[0], editingLesson.type, setEditingLesson)} />
                            </label>
                          )}

                          <input
                            type="number"
                            value={editingLesson.duration_mins || ''}
                            onChange={(e) => setEditingLesson((l) => ({ ...l, duration_mins: e.target.value }))}
                            placeholder="Duration (mins)"
                            className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingLesson.is_free}
                              onChange={(e) => setEditingLesson((l) => ({ ...l, is_free: e.target.checked }))}
                              className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                            />
                            <span className="text-sm text-[var(--color-ink-muted)]">Free preview</span>
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingLesson(null)}
                              className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink-muted)] bg-[var(--color-surface)] hover:bg-[var(--color-canvas)]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => updateLesson.mutate(editingLesson)}
                              disabled={!editingLesson.title.trim() || updateLesson.isPending}
                              className="px-3 py-1.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] disabled:opacity-50"
                            >
                              {updateLesson.isPending ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-[var(--color-canvas)] transition-colors">
                      <span className="text-xs font-bold text-[var(--color-ink-faint)] w-5 text-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-ink)] truncate">{lesson.title}</p>
                        <p className="text-xs text-[var(--color-ink-muted)] capitalize">
                          {lesson.type}{lesson.duration_mins ? ` · ${lesson.duration_mins}m` : ''}
                          {lesson.is_free && <span className="ml-1 text-[var(--color-success)]">· Free</span>}
                          {lesson.content_url && <span className="ml-1 text-[var(--color-ink-faint)]">· has URL</span>}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setEditingLesson({ ...lesson })}
                          className="p-1.5 rounded-lg text-[var(--color-ink-faint)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                          title="Edit"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          onClick={() => deleteLesson.mutate(lesson.id)}
                          className="p-1.5 rounded-lg text-[var(--color-ink-faint)] hover:text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Quiz tab ── */}
      {tab === 'Quiz' && (
        <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
          {!quiz ? (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 max-w-md">
              <p className="font-bold text-[var(--color-ink)] text-sm mb-4">Create quiz</p>
              <div className="space-y-3">
                <input
                  placeholder="Quiz title *"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-[var(--color-ink-muted)] mb-1 block">Passing score (%)</label>
                    <input
                      type="number"
                      value={quizForm.passing_score}
                      onChange={(e) => setQuizForm((f) => ({ ...f, passing_score: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                  <label className="flex items-end gap-2 pb-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizForm.allow_retry}
                      onChange={(e) => setQuizForm((f) => ({ ...f, allow_retry: e.target.checked }))}
                      className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                    <span className="text-sm text-[var(--color-ink-muted)]">Allow retry</span>
                  </label>
                </div>
                <button
                  onClick={() => createQuiz.mutate()}
                  disabled={!quizForm.title.trim() || createQuiz.isPending}
                  className="w-full py-2.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] disabled:opacity-50 active:scale-[0.97] transition-all"
                  style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  {createQuiz.isPending ? 'Creating...' : 'Create quiz'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Quiz info */}
              <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-[var(--color-ink)] text-sm">{quiz.title}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    Passing: {quiz.passing_score}% &middot; Retry: {quiz.allow_retry ? 'Yes' : 'No'} &middot; {quiz.questions?.length || 0} questions
                  </p>
                </div>
              </div>

              {/* Add question */}
              <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
                <p className="font-bold text-[var(--color-ink)] text-sm mb-4">Add question</p>
                <div className="space-y-3">
                  <input
                    placeholder="Question text *"
                    value={qForm.question}
                    onChange={(e) => setQForm((f) => ({ ...f, question: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {qForm.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          onClick={() => setQForm((f) => ({ ...f, correct_index: i }))}
                          className="flex-shrink-0"
                        >
                          {qForm.correct_index === i
                            ? <CheckCircle size={18} weight="fill" className="text-[var(--color-accent)]" />
                            : <Circle size={18} className="text-[var(--color-ink-faint)]" />
                          }
                        </button>
                        <input
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const opts = [...qForm.options]
                            opts[i] = e.target.value
                            setQForm((f) => ({ ...f, options: opts }))
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-ink-muted)]">Click circle to mark correct answer</p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => addQuestion.mutate()}
                      disabled={!qForm.question.trim() || qForm.options.filter((o) => o.trim()).length < 2 || addQuestion.isPending}
                      className="px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] disabled:opacity-50 active:scale-[0.97] transition-all"
                      style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      {addQuestion.isPending ? 'Adding...' : 'Add question'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions list */}
              {quiz.questions?.length > 0 && (
                <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[var(--color-border-soft)]">
                    <p className="text-sm font-bold text-[var(--color-ink)]">Questions ({quiz.questions.length})</p>
                  </div>
                  <div className="divide-y divide-[var(--color-border-soft)]">
                    {quiz.questions.map((q, i) => (
                      <div key={q.id} className="px-5 py-3.5 group hover:bg-[var(--color-canvas)] transition-colors">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-bold text-[var(--color-ink-faint)] mt-0.5 w-4">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-ink)] mb-1.5">{q.question}</p>
                            <div className="grid grid-cols-2 gap-1">
                              {q.options.map((opt, oi) => (
                                <p key={oi} className={`text-xs px-2 py-1 rounded-lg ${oi === q.correct_index ? 'bg-[var(--color-success-soft)] text-[var(--color-success)] font-medium' : 'text-[var(--color-ink-muted)]'}`}>
                                  {opt}
                                </p>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteQuestion.mutate(q.id)}
                            className="p-1.5 rounded-lg text-[var(--color-ink-faint)] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
