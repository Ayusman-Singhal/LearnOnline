import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Student, ChalkboardTeacher } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'
import { useUser } from '../../hooks/useUser'
import { ease, spring } from '../../lib/motion'
import { cn } from '../../lib/utils'

export default function WelcomePage() {
  const navigate = useNavigate()
  const api = useApi()
  const qc = useQueryClient()
  const { clerkUser } = useUser()
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState(null)

  const setRole = useMutation({
    mutationFn: (role) => api.patch('/api/users/me/role', { role }),
    onSuccess: (res, role) => {
      qc.invalidateQueries(['user', 'me'])
      localStorage.setItem('welcomed', clerkUser?.id || 'done')
      navigate('/dashboard')
      toast.success(role === 'instructor' ? 'Welcome, instructor.' : 'Welcome aboard.')
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-[var(--color-canvas)]">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...spring.soft, delay: 0.05 }}
        className="w-full max-w-md"
      >
        {/* Wordmark */}
        <div className="text-center mb-10">
          <div className="relative w-14 h-14 rounded-[14px] bg-[var(--color-ink)] flex items-center justify-center mx-auto mb-6 overflow-hidden">
            <span
              className="font-black text-white text-2xl leading-none"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              L
            </span>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--color-accent)] rounded-tl-sm" />
          </div>
          <h1
            className="text-2xl font-black text-[var(--color-ink)] tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}
          >
            Welcome{clerkUser?.firstName ? `, ${clerkUser.firstName}` : ''}.
          </h1>
          <p className="text-[var(--color-ink-muted)] mt-2 text-sm">
            How will you use LearnOnline?
          </p>
        </div>

        {/* Role picker */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            {
              role: 'student',
              label: 'Learn',
              sub: 'Enroll in courses and earn certificates',
              Icon: Student,
              iconBg: 'bg-[var(--color-accent-soft)]',
              iconCol: 'text-[var(--color-accent)]',
            },
            {
              role: 'instructor',
              label: 'Teach',
              sub: 'Create courses and earn from enrollments',
              Icon: ChalkboardTeacher,
              iconBg: 'bg-[var(--color-success-soft)]',
              iconCol: 'text-[var(--color-success)]',
            },
          ].map(({ role, label, sub, Icon, iconBg, iconCol }) => (
            <motion.button
              key={role}
              onClick={() => setSelected(role)}
              className={cn(
                'flex flex-col items-center gap-4 p-6 rounded-2xl border-2 text-center transition-all',
                selected === role
                  ? 'border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[0_0_0_3px_rgba(26,23,20,0.06)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-ink-faint)]',
              )}
              style={{ transition: `all 200ms cubic-bezier(${ease.outExpo.join(',')})` }}
              whileHover={reduce ? {} : { y: -2, transition: { ...spring.snappy } }}
              whileTap={reduce ? {} : { scale: 0.98 }}
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
                <Icon size={22} weight="fill" className={iconCol} />
              </div>
              <div>
                <p
                  className="font-black text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {label}
                </p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-snug">{sub}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => selected && setRole.mutate(selected)}
          disabled={!selected || setRole.isPending}
          className={cn(
            'w-full h-11 rounded-xl text-white font-semibold text-sm',
            'bg-[var(--color-ink)] hover:bg-[#2A2520]',
            'disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]',
          )}
          style={{ transition: `all 200ms cubic-bezier(${ease.outExpo.join(',')})` }}
        >
          {setRole.isPending ? 'Setting up…' : 'Continue'}
        </button>

        <p className="text-center text-xs text-[var(--color-ink-faint)] mt-4">
          You can change this in Settings
        </p>
      </motion.div>
    </div>
  )
}
