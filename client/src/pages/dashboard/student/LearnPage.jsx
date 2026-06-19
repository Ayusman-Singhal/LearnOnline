import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle, Circle, Play, FileText, List, X,
  ArrowLeft, Trophy, BookOpen, Question, Certificate,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApi } from '../../../hooks/useApi'

function VideoEmbed({ url }) {
  const yt = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  const vi = url?.match(/vimeo\.com\/(\d+)/)
  if (yt) return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
      <iframe src={`https://www.youtube.com/embed/${yt[1]}`} className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Lesson video" />
    </div>
  )
  if (vi) return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
      <iframe src={`https://player.vimeo.com/video/${vi[1]}`} className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Lesson video" />
    </div>
  )
  return (
    <div className="aspect-video w-full rounded-xl bg-[var(--color-ink)] flex items-center justify-center">
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline text-sm">Open video</a>
    </div>
  )
}

function QuizView({ quiz, courseId }) {
  const api = useApi()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null) // fresh submission result
  const [submitting, setSubmitting] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [certClaimed, setCertClaimed] = useState(false)

  const questions = quiz.questions || []

  // Load existing attempt on mount
  const { data: prevAttempt, isLoading: attemptLoading } = useQuery({
    queryKey: ['quiz-attempt', quiz.id],
    queryFn: () => api.get(`/api/quizzes/${quiz.id}/my-attempt`),
    retry: false,
  })

  const displayResult = result ?? prevAttempt // show fresh result or existing

  const submit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Answer all questions first')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post(`/api/quizzes/${quiz.id}/attempt`, { answers })
      setResult(res)
      qc.invalidateQueries({ queryKey: ['quiz-attempt', quiz.id] })
    } catch (e) {
      toast.error(e.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const claimCertificate = async () => {
    setClaiming(true)
    try {
      await api.post(`/api/certificates/course/${courseId}/claim`, {})
      qc.invalidateQueries({ queryKey: ['certificates', 'my'] })
      setCertClaimed(true)
      toast.success('Certificate generated!')
    } catch (e) {
      toast.error(e.message || 'Failed to generate certificate')
    } finally {
      setClaiming(false)
    }
  }

  if (attemptLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show result screen if passed or just submitted
  if (displayResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="text-center py-8"
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${displayResult.passed ? 'bg-[var(--color-success-soft)]' : 'bg-red-50'}`}>
          {displayResult.passed
            ? <Trophy size={36} weight="fill" className="text-[var(--color-success)]" />
            : <X size={36} weight="bold" className="text-red-400" />}
        </div>
        <p className="text-3xl font-black text-[var(--color-ink)] mb-1">{displayResult.score}%</p>
        <p className={`text-sm font-semibold mb-1 ${displayResult.passed ? 'text-[var(--color-success)]' : 'text-red-500'}`}>
          {displayResult.passed ? 'Passed!' : 'Not passed'}
        </p>
        <p className="text-xs text-[var(--color-ink-muted)] mb-8">Passing score: {quiz.passing_score}%</p>

        {displayResult.passed ? (
          <div className="flex flex-col items-center gap-3">
            {certClaimed ? (
              <button
                onClick={() => navigate('/dashboard/certificates')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-sm hover:bg-[#2A2520] active:scale-[0.98] transition-all"
                style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <Certificate size={16} weight="fill" /> View my certificates
              </button>
            ) : (
              <button
                onClick={claimCertificate}
                disabled={claiming}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-sm hover:bg-[#2A2520] disabled:opacity-50 active:scale-[0.98] transition-all"
                style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <Certificate size={16} weight="fill" />
                {claiming ? 'Generating...' : 'Generate certificate'}
              </button>
            )}
            <p className="text-xs text-[var(--color-ink-muted)]">Quiz locked you already passed</p>
          </div>
        ) : (
          quiz.allow_retry && (
            <button
              onClick={() => { setResult(null); setAnswers({}) }}
              className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors"
            >
              Try again
            </button>
          )
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="text-xl font-black text-[var(--color-ink)] mb-1">{quiz.title}</h1>
      <p className="text-xs text-[var(--color-ink-muted)] mb-6">{questions.length} question{questions.length !== 1 ? 's' : ''} · Passing score: {quiz.passing_score}%</p>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
            <p className="font-semibold text-[var(--color-ink)] text-sm mb-4">{qi + 1}. {q.question}</p>
            <div className="space-y-2">
              {(q.options || []).map((opt, oi) => (
                <label
                  key={oi}
                  className={[
                    'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                    answers[q.id] === oi
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border)] hover:bg-[var(--color-canvas)]',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={oi}
                    checked={answers[q.id] === oi}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className="w-4 h-4 text-[var(--color-accent)] border-[var(--color-border)] focus:ring-[var(--color-accent)]"
                  />
                  <span className="text-sm text-[var(--color-ink)]">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--color-border-soft)]">
        <button
          onClick={submit}
          disabled={submitting || Object.keys(answers).length < questions.length}
          className="px-6 py-2.5 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-sm hover:bg-[#2A2520] disabled:opacity-50 active:scale-[0.98] transition-all"
          style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {submitting ? 'Submitting...' : 'Submit quiz'}
        </button>
        <p className="text-xs text-[var(--color-ink-muted)] mt-2">{Object.keys(answers).length}/{questions.length} answered</p>
      </div>
    </motion.div>
  )
}

export default function LearnPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const api = useApi()
  const qc = useQueryClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeLesson, setActiveLesson] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`)
      if (!res.ok) throw new Error('Course not found')
      return res.json()
    },
  })

  const { data: progressData = [] } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => api.get(`/api/progress/course/${courseId}`),
    retry: false,
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => api.get('/api/enrollments/my'),
  })

  const { data: quiz } = useQuery({
    queryKey: ['quiz', courseId],
    queryFn: () => api.get(`/api/quizzes/course/${courseId}`),
    retry: false,
  })

  // Fetch quiz pass status at page level so certificate button logic works
  const { data: quizAttempt } = useQuery({
    queryKey: ['quiz-attempt', quiz?.id],
    queryFn: () => api.get(`/api/quizzes/${quiz.id}/my-attempt`),
    enabled: !!quiz?.id,
    retry: false,
  })
  const quizPassed = !quiz || quizAttempt?.passed === true

  const lessons = course?.lessons?.slice().sort((a, b) => a.sort_order - b.sort_order) || []
  const completedIds = new Set(progressData.map((p) => p.lesson_id))
  const enrollment = enrollments.find((e) => e.course_id === courseId)
  const progress = enrollment?.progress_percent || 0
  const allDone = lessons.length > 0 && completedIds.size >= lessons.length

  useEffect(() => {
    if (lessons.length && !activeLesson) {
      const lastId = enrollment?.last_lesson_id
      const resume = lastId ? lessons.find((l) => l.id === lastId) : null
      setActiveLesson(resume || lessons[0])
    }
  }, [lessons.length])

  const markComplete = useMutation({
    mutationFn: (lessonId) =>
      api.post(`/api/progress/lesson/${lessonId}/complete`, { course_id: courseId }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['progress', courseId] })
      qc.invalidateQueries({ queryKey: ['enrollments', 'my'] })
      qc.invalidateQueries({ queryKey: ['certificates', 'my'] })
      if (data.progress_percent === 100) {
        toast.success(data.certificate ? 'Course complete! Certificate issued.' : 'Course complete!')
      } else {
        toast.success('Lesson marked complete')
      }
    },
    onError: () => toast.error('Failed to mark complete'),
  })

  const goNext = () => {
    const idx = lessons.findIndex((l) => l.id === activeLesson?.id)
    if (idx < lessons.length - 1) {
      setActiveLesson(lessons[idx + 1])
      setShowQuiz(false)
    } else if (quiz) {
      setShowQuiz(true)
    }
  }
  const isLast = lessons.findIndex((l) => l.id === activeLesson?.id) === lessons.length - 1

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-ink-muted)]">Course not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={[
          'fixed lg:relative top-0 left-0 h-full w-72 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-30 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}>
          <div className="p-4 border-b border-[var(--color-border-soft)] flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[var(--color-ink)] text-sm truncate">{course.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-[var(--color-canvas)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-[var(--color-ink)] rounded-full"
                  />
                </div>
                <span className="text-xs text-[var(--color-ink-muted)] flex-shrink-0">{progress}%</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-3 p-1 rounded-lg hover:bg-[var(--color-canvas)] text-[var(--color-ink-muted)]">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {lessons.map((lesson, i) => {
              const done = completedIds.has(lesson.id)
              const active = !showQuiz && activeLesson?.id === lesson.id
              return (
                <button
                  key={lesson.id}
                  onClick={() => { setActiveLesson(lesson); setShowQuiz(false); setSidebarOpen(false) }}
                  className={[
                    'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-l-2',
                    active ? 'bg-[var(--color-accent-soft)] border-[var(--color-ink)]' : 'border-transparent hover:bg-[var(--color-canvas)]',
                  ].join(' ')}
                >
                  {done
                    ? <CheckCircle size={18} weight="fill" className="text-[var(--color-success)] flex-shrink-0" />
                    : <Circle size={18} className="text-[var(--color-ink-faint)] flex-shrink-0" />}
                  <p className={['text-xs font-medium truncate', active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink)]'].join(' ')}>
                    {i + 1}. {lesson.title}
                  </p>
                </button>
              )
            })}

            {/* Quiz entry in sidebar */}
            {quiz && (
              <button
                onClick={() => { setShowQuiz(true); setSidebarOpen(false) }}
                className={[
                  'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-l-2',
                  showQuiz ? 'bg-[var(--color-accent-soft)] border-[var(--color-ink)]' : 'border-transparent hover:bg-[var(--color-canvas)]',
                  !allDone ? 'opacity-40 cursor-not-allowed' : '',
                ].join(' ')}
                disabled={!allDone}
                title={!allDone ? 'Complete all lessons first' : ''}
              >
                <Question size={18} className={showQuiz ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-faint)]'} weight="fill" />
                <div className="min-w-0">
                  <p className={['text-xs font-medium truncate', showQuiz ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink)]'].join(' ')}>
                    Quiz: {quiz.title}
                  </p>
                  {!allDone && <p className="text-[10px] text-[var(--color-ink-muted)]">Complete all lessons first</p>}
                </div>
              </button>
            )}
          </div>

          <div className="p-4 border-t border-[var(--color-border-soft)]">
            <button
              onClick={() => navigate('/dashboard/my-courses')}
              className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              <ArrowLeft size={13} /> Back to my courses
            </button>
          </div>
        </aside>
      </>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-3xl">
          {/* Mobile header */}
          <div className="flex items-center gap-3 mb-5 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-canvas)] transition-colors"
            >
              <List size={18} className="text-[var(--color-ink-muted)]" />
            </button>
            <p className="font-semibold text-[var(--color-ink)] text-sm truncate">
              {showQuiz ? quiz?.title : activeLesson?.title}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {showQuiz && quiz ? (
              <QuizView key="quiz" quiz={quiz} courseId={courseId} />
            ) : activeLesson ? (
              <motion.div
                key={activeLesson.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="text-xl font-black text-[var(--color-ink)] mb-1 hidden lg:block">{activeLesson.title}</h1>
                <p className="text-xs text-[var(--color-ink-muted)] mb-5 hidden lg:block capitalize">
                  {activeLesson.type || 'lesson'}
                  {activeLesson.duration_mins ? ` · ${activeLesson.duration_mins} min` : ''}
                </p>

                {activeLesson.type === 'video' && activeLesson.content_url && (
                  <div className="mb-6"><VideoEmbed url={activeLesson.content_url} /></div>
                )}
                {activeLesson.type === 'image' && activeLesson.content_url && (
                  <div className="mb-6">
                    <img src={activeLesson.content_url} alt={activeLesson.title}
                      className="w-full rounded-xl border border-[var(--color-border-soft)] object-contain max-h-[60vh]" />
                  </div>
                )}
                {activeLesson.type === 'pdf' && activeLesson.content_url && (
                  <div className="mb-6">
                    <iframe src={activeLesson.content_url} title={activeLesson.title}
                      className="w-full h-[70vh] rounded-xl border border-[var(--color-border-soft)]" />
                  </div>
                )}
                {activeLesson.type === 'text' && activeLesson.content_url && (
                  <div className="mb-8 text-[var(--color-ink)] text-sm leading-relaxed whitespace-pre-wrap bg-[var(--color-canvas)] rounded-xl p-5">
                    {activeLesson.content_url}
                  </div>
                )}
                {!activeLesson.content_url && (
                  <div className="py-16 text-center text-[var(--color-ink-muted)]">
                    <FileText size={32} className="mx-auto mb-3 text-[var(--color-border)]" />
                    <p className="text-sm">No content for this lesson yet.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center flex-wrap gap-3 mt-6 pt-6 border-t border-[var(--color-border-soft)]">
                  {completedIds.has(activeLesson.id) ? (
                    <div className="flex items-center gap-2 text-[var(--color-success)] text-sm font-semibold">
                      <CheckCircle size={18} weight="fill" /> Completed
                    </div>
                  ) : (
                    <button
                      onClick={() => markComplete.mutate(activeLesson.id)}
                      disabled={markComplete.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-sm hover:bg-[#2A2520] disabled:opacity-50 active:scale-[0.98] transition-all"
                      style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      <CheckCircle size={16} />
                      {markComplete.isPending ? 'Saving...' : 'Mark complete'}
                    </button>
                  )}

                  {!isLast && (
                    <button
                      onClick={goNext}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-ink)] font-semibold text-sm hover:bg-[var(--color-canvas)] active:scale-[0.98] transition-all"
                      style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      Next lesson <Play size={13} weight="fill" />
                    </button>
                  )}

                  {isLast && quiz && allDone && (
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-sm hover:bg-[#2A2520] active:scale-[0.98] transition-all"
                      style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      <Question size={14} weight="fill" /> Take quiz
                    </button>
                  )}

                  {progress === 100 && quizPassed && (
                    <div className="ml-auto flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-amber-500 text-sm font-bold">
                        <Trophy size={18} weight="fill" /> Complete!
                      </div>
                      <button
                        onClick={() => navigate('/dashboard/certificates')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                      >
                        <Certificate size={13} weight="fill" /> View certificate
                      </button>
                    </div>
                  )}
                  {progress === 100 && !quizPassed && quiz && (
                    <div className="ml-auto flex items-center gap-1.5 text-[var(--color-ink-muted)] text-xs">
                      <Question size={14} weight="fill" /> Pass the quiz to complete this course
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-20 text-[var(--color-ink-muted)]">
                <BookOpen size={32} className="mx-auto mb-3 text-[var(--color-border)]" />
                <p>Select a lesson to begin</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
