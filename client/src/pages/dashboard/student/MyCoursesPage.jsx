import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Play, Trophy, ArrowRight } from '@phosphor-icons/react'
import { useApi } from '../../../hooks/useApi'

function ProgressBar({ percent }) {
  return (
    <div className="w-full h-1.5 bg-[var(--color-canvas)] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={[
          'h-full rounded-full',
          percent === 100 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-ink)]',
        ].join(' ')}
      />
    </div>
  )
}

function CourseCard({ enrollment, index }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const course = enrollment.courses
  const progress = enrollment.progress_percent || 0
  const done = progress === 100

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow group"
    >
      <div className="relative h-36 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-accent-soft)] flex items-center justify-center">
            <BookOpen size={32} className="text-[var(--color-accent)]" />
          </div>
        )}
        {done && (
          <div className="absolute top-3 right-3 bg-[var(--color-success)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Trophy size={11} /> Complete
          </div>
        )}
      </div>

      <div className="p-4">
        <span className="text-[11px] font-semibold text-[var(--color-accent)] uppercase tracking-wide mb-1 block">
          {course.categories?.name || 'Course'}
        </span>
        <h3 className="font-bold text-[var(--color-ink)] text-sm leading-snug mb-1">{course.title}</h3>
        <p className="text-xs text-[var(--color-ink-muted)] mb-4">{course.users?.name || 'Instructor'}</p>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-[var(--color-ink-muted)] mb-1.5">
            <span>{done ? 'Completed' : 'Progress'}</span>
            <span className={done ? 'text-[var(--color-success)] font-semibold' : ''}>{progress}%</span>
          </div>
          <ProgressBar percent={progress} />
        </div>

        <button
          onClick={() => navigate(`/dashboard/learn/${course.id}`)}
          className="w-full py-2.5 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-xs hover:bg-[#2A2520] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {done ? (
            <><Trophy size={13} /> View certificate</>
          ) : progress > 0 ? (
            <><Play size={13} weight="fill" /> Continue</>
          ) : (
            <><Play size={13} weight="fill" /> Start learning</>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default function MyCoursesPage() {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const api = useApi()

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => api.get('/api/enrollments/my'),
  })

  return (
    <div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">My courses</h1>
          <p className="text-[var(--color-ink-muted)] mt-1 text-sm">
            {enrollments.length > 0
              ? `${enrollments.length} course${enrollments.length !== 1 ? 's' : ''} enrolled`
              : 'Start learning by enrolling in a course'}
          </p>
        </div>
        <button
          onClick={() => navigate('/courses')}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] transition-colors"
        >
          Browse courses <ArrowRight size={14} />
        </button>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse">
              <div className="h-36 bg-[var(--color-canvas)]" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 bg-[var(--color-canvas)] rounded" />
                <div className="h-4 w-3/4 bg-[var(--color-canvas)] rounded" />
                <div className="h-2 bg-[var(--color-canvas)] rounded mt-4" />
                <div className="h-9 bg-[var(--color-canvas)] rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-[var(--color-accent)]" />
          </div>
          <p className="font-bold text-[var(--color-ink)] mb-1">No courses yet</p>
          <p className="text-[var(--color-ink-muted)] text-sm mb-6">Enroll in a course to start learning</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-2.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] transition-colors"
          >
            Browse courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((enrollment, i) => (
            <CourseCard key={enrollment.id} enrollment={enrollment} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
