import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import {
  BookOpen, CheckCircle, Lock, Play, ArrowLeft, GraduationCap, X,
} from '@phosphor-icons/react'
import { useApi } from '../hooks/useApi'
import CheckoutModal from '../components/checkout/CheckoutModal'
import Footer from '../components/layout/Footer'

function PreviewEmbed({ url }) {
  const yt = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  const vi = url?.match(/vimeo\.com\/(\d+)/)
  if (yt) return (
    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
      <iframe src={`https://www.youtube.com/embed/${yt[1]}?autoplay=1`} className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </div>
  )
  if (vi) return (
    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
      <iframe src={`https://player.vimeo.com/video/${vi[1]}?autoplay=1`} className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
    </div>
  )
  return (
    <div className="aspect-video w-full bg-[var(--color-ink)] rounded-xl flex items-center justify-center">
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline text-sm">Open video</a>
    </div>
  )
}

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const api = useApi()
  const [showCheckout, setShowCheckout] = useState(false)
  const [previewLesson, setPreviewLesson] = useState(null)

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${id}`)
      if (!res.ok) throw new Error('Course not found')
      return res.json()
    },
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => api.get('/api/enrollments/my'),
    enabled: isSignedIn,
    staleTime: 0,
  })

  const isEnrolled = enrollments.some((e) => e.course_id === id)
  const instructor = course?.users
  const lessons = course?.lessons?.slice().sort((a, b) => a.sort_order - b.sort_order) || []
  const freeLessons = lessons.filter((l) => l.is_free)

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-surface)]">
        <div className="pt-28 max-w-5xl mx-auto px-4 animate-pulse space-y-4">
          <div className="h-8 w-2/3 bg-[var(--color-canvas)] rounded" />
          <div className="h-4 w-1/3 bg-[var(--color-canvas)] rounded" />
          <div className="h-56 bg-[var(--color-canvas)] rounded-2xl mt-6" />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-surface)] flex items-center justify-center">
        <div className="text-center pt-28">
          <p className="text-[var(--color-ink-muted)] text-lg">Course not found</p>
          <Link to="/courses" className="text-[var(--color-accent)] text-sm mt-2 inline-block hover:opacity-80">
            Browse all courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-surface)]">
      {/* Hero */}
      <div className="pt-20 bg-[var(--color-ink)] text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-all -ml-2 px-2 py-1 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft size={15} /> Back to courses
          </Link>
          <div className="grid md:grid-cols-[1fr_320px] gap-8 items-start">
            <div>
              <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wide mb-3 block">
                {course.categories?.name || 'Course'}
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4 leading-tight">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xl">
                  {course.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} /> {lessons.length} lessons
                </span>
                {freeLessons.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Play size={15} className="text-[var(--color-success)]" /> {freeLessons.length} free preview
                  </span>
                )}
                {instructor && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={15} /> By {instructor.name}
                  </span>
                )}
              </div>
            </div>

            {/* Enrollment card */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-5 text-[var(--color-ink)] shadow-xl sticky top-24">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-[var(--color-canvas)] rounded-xl mb-4 flex items-center justify-center">
                  <BookOpen size={32} className="text-[var(--color-ink-faint)]" />
                </div>
              )}
              <div className="text-3xl font-black mb-4">
                {course.price > 0 ? `₹${course.price}` : 'Free'}
              </div>

              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/dashboard/learn/${course.id}`)}
                  className="w-full py-3 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-sm hover:bg-[#2A2520] active:scale-[0.98] transition-all mb-3"
                  style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  Continue learning
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!isSignedIn) navigate('/sign-in')
                    else setShowCheckout(true)
                  }}
                  className="w-full py-3 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-sm hover:bg-[#2A2520] active:scale-[0.98] transition-all mb-3"
                  style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  {course.price > 0 ? 'Enroll now' : 'Enroll for free'}
                </button>
              )}

              <p className="text-center text-xs text-[var(--color-ink-muted)]">30-day money-back guarantee</p>

              <div className="mt-4 pt-4 border-t border-[var(--color-border-soft)] space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                  <BookOpen size={14} className="text-[var(--color-accent)]" />
                  {lessons.length} lessons
                </div>
                {freeLessons.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                    <Play size={14} className="text-[var(--color-success)]" />
                    {freeLessons.length} free preview lessons
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                  <CheckCircle size={14} className="text-[var(--color-accent)]" />
                  Certificate on completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        <div className="max-w-2xl">
          <h2 className="text-xl font-black text-[var(--color-ink)] mb-5">Course content</h2>
          {lessons.length === 0 ? (
            <p className="text-[var(--color-ink-muted)] text-sm">No lessons added yet.</p>
          ) : (
            <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden divide-y divide-[var(--color-border-soft)]">
              {lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={lesson.is_free && lesson.content_url ? () => setPreviewLesson(lesson) : undefined}
                  className={['flex items-center gap-3 px-5 py-3.5 transition-colors', lesson.is_free && lesson.content_url ? 'cursor-pointer hover:bg-[var(--color-accent-soft)]' : ''].join(' ')}
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-canvas)] flex items-center justify-center flex-shrink-0">
                    {lesson.is_free ? (
                      <Play size={13} weight="fill" className="text-[var(--color-accent)]" />
                    ) : (
                      <Lock size={13} className="text-[var(--color-ink-muted)]" />
                    )}
                  </div>
                  <span className="text-sm text-[var(--color-ink)] flex-1">{lesson.title}</span>
                  {lesson.is_free && (
                    <span className="text-[10px] font-bold text-[var(--color-success)] bg-[var(--color-success-soft)] px-2 py-0.5 rounded-full">
                      {lesson.content_url ? 'Watch preview' : 'Preview'}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Instructor */}
        {instructor && (
          <div className="max-w-2xl mt-12">
            <h2 className="text-xl font-black text-[var(--color-ink)] mb-5">Your instructor</h2>
            <div className="flex items-center gap-4">
              {instructor.avatar_url ? (
                <img src={instructor.avatar_url} alt={instructor.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center">
                  <span className="text-[var(--color-accent)] text-xl font-bold">{instructor.name?.[0]}</span>
                </div>
              )}
              <div>
                <p className="font-bold text-[var(--color-ink)]">{instructor.name}</p>
                <p className="text-sm text-[var(--color-ink-muted)]">Instructor</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {showCheckout && (
        <CheckoutModal
          course={course}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {/* Free preview modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setPreviewLesson(null)}>
          <div className="relative w-full max-w-2xl bg-[var(--color-ink)] rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-white font-semibold text-sm truncate">{previewLesson.title}</p>
              <button onClick={() => setPreviewLesson(null)} className="ml-3 w-7 h-7 rounded-full bg-[var(--color-surface)]/10 flex items-center justify-center hover:bg-[var(--color-surface)]/20 flex-shrink-0">
                <X size={14} className="text-white" />
              </button>
            </div>
            <div className="p-4">
              {previewLesson.type === 'video' && <PreviewEmbed url={previewLesson.content_url} />}
              {previewLesson.type === 'image' && (
                <img src={previewLesson.content_url} alt={previewLesson.title} className="w-full rounded-xl object-contain max-h-[60vh]" />
              )}
              {previewLesson.type === 'pdf' && (
                <iframe src={previewLesson.content_url} title={previewLesson.title} className="w-full h-[60vh] rounded-xl bg-[var(--color-surface)]" />
              )}
              {previewLesson.type === 'text' && (
                <div className="text-[var(--color-border)] text-sm leading-relaxed whitespace-pre-wrap bg-[var(--color-ink)] rounded-xl p-4 max-h-[60vh] overflow-y-auto">
                  {previewLesson.content_url}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
