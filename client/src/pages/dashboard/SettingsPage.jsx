import { useState, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useClerk } from '@clerk/clerk-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCircle, Bell, Camera, ArrowsLeftRight, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useUser } from '../../hooks/useUser'
import { useApi } from '../../hooks/useApi'
import { ease, dur, spring } from '../../lib/motion'
import { cn } from '../../lib/utils'

export default function SettingsPage() {
  const reduce = useReducedMotion()
  const { clerkUser, user: dbUser, role } = useUser()
  const { openUserProfile } = useClerk()
  const api = useApi()
  const qc = useQueryClient()
  const avatarInputRef = useRef(null)

  const [nameEdit, setNameEdit] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [profileSaving, setProfileSaving] = useState(false)

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const saveProfile = async () => {
    const hasName = nameEdit.trim().length > 0
    const hasAvatar = !!avatarFile
    if (!hasName && !hasAvatar) return toast.error('Nothing to update')
    setProfileSaving(true)
    try {
      let avatar_url
      if (hasAvatar) {
        const fd = new FormData()
        fd.append('file', avatarFile)
        fd.append('type', 'image')
        fd.append('folder', 'learnonline/avatars')
        const uploadResult = await api.post('/api/uploads', fd)
        avatar_url = uploadResult.url
        try { await clerkUser.setProfileImage({ file: avatarFile }) } catch {}
      }
      if (hasName) {
        const parts = nameEdit.trim().split(' ')
        try { await clerkUser.update({ firstName: parts[0], lastName: parts.slice(1).join(' ') || '' }) } catch {}
      }
      await api.patch('/api/users/me/profile', {
        ...(hasName ? { name: nameEdit.trim() } : {}),
        ...(avatar_url ? { avatar_url } : {}),
      })
      qc.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('Profile updated')
      setNameEdit('')
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (e) {
      toast.error(e.message || 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('notif_prefs')
      return saved ? JSON.parse(saved) : { enrollment: true, newLesson: true, announcement: false, certificate: true }
    } catch { return { enrollment: true, newLesson: true, announcement: false, certificate: true } }
  })

  const toggleNotif = (key) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem('notif_prefs', JSON.stringify(next))
      return next
    })
    toast.success('Preference saved')
  }

  const switchRole = useMutation({
    mutationFn: (newRole) => api.patch('/api/users/me/role', { role: newRole }),
    onSuccess: (_, newRole) => {
      qc.invalidateQueries(['user', 'me'])
      toast.success(`Switched to ${newRole}`)
    },
    onError: (e) => toast.error(e.message),
  })

  const cardBase = 'bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6'
  const sectionBtn = cn(
    'px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium',
    'text-[var(--color-ink)] hover:bg-[var(--color-canvas)] active:scale-[0.97]',
  )

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
          Settings
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">Manage your account and preferences.</p>
      </motion.div>

      <div className="space-y-4 max-w-2xl">
        {/* Profile */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.soft, delay: 0.07 }}
          className={cardBase}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center">
              <UserCircle size={18} className="text-[var(--color-accent)]" weight="fill" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-ink)] text-sm">Profile</p>
              <p className="text-xs text-[var(--color-ink-muted)]">Your name, photo, and email</p>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-5">
            {/* Avatar */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="relative group flex-shrink-0"
              aria-label="Change profile photo"
            >
              {avatarPreview || dbUser?.avatar_url || clerkUser?.imageUrl ? (
                <img
                  src={avatarPreview || dbUser?.avatar_url || clerkUser?.imageUrl}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center">
                  <span className="text-[var(--color-accent)] text-xl font-black" style={{ fontFamily: 'var(--font-serif)' }}>
                    {(dbUser?.name || clerkUser?.firstName || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={18} className="text-white" />
              </span>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </button>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-1">Display name</p>
              <input
                type="text"
                value={nameEdit}
                onChange={(e) => setNameEdit(e.target.value)}
                placeholder={dbUser?.name || clerkUser?.fullName || 'Your name'}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-[var(--color-canvas)] mb-1"
              />
              <p className="text-xs text-[var(--color-ink-muted)]">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          {(nameEdit.trim() || avatarFile) && (
            <button
              onClick={saveProfile}
              disabled={profileSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] disabled:opacity-50 active:scale-[0.97] transition-all mb-2"
              style={{ transition: `all 180ms cubic-bezier(${ease.outExpo.join(',')})` }}
            >
              <Check size={14} weight="bold" />
              {profileSaving ? 'Saving…' : 'Save changes'}
            </button>
          )}

          <button
            onClick={() => openUserProfile()}
            className={sectionBtn}
            style={{ transition: `all 180ms cubic-bezier(${ease.outExpo.join(',')})` }}
          >
            Password &amp; advanced settings
          </button>
        </motion.div>

        {/* Account type */}
        {role !== 'admin' && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.soft, delay: 0.15 }}
            className={cardBase}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-success-soft)] flex items-center justify-center">
                <ArrowsLeftRight size={16} className="text-[var(--color-success)]" weight="fill" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-ink)] text-sm">Account type</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Currently: <span className="font-bold text-[var(--color-ink)] capitalize">{role}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {role === 'student'
                ? 'Switch to instructor to create and sell courses. Your enrolled courses stay intact.'
                : 'Switch to student to browse and enroll in courses. Your created courses stay intact.'}
            </p>
            <button
              onClick={() => {
                const next = role === 'student' ? 'instructor' : 'student'
                if (window.confirm(`Switch to ${next}? You can switch back anytime.`)) {
                  switchRole.mutate(next)
                }
              }}
              disabled={switchRole.isPending}
              className={cn(sectionBtn, 'disabled:opacity-50')}
              style={{ transition: `all 180ms cubic-bezier(${ease.outExpo.join(',')})` }}
            >
              {switchRole.isPending ? 'Switching…' : `Switch to ${role === 'student' ? 'instructor' : 'student'}`}
            </button>
          </motion.div>
        )}

        {/* Notifications */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.soft, delay: 0.17 }}
          className={cardBase}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Bell size={16} className="text-amber-600" weight="fill" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-ink)] text-sm">Notifications</p>
              <p className="text-xs text-[var(--color-ink-muted)]">Control when we email you</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'enrollment',   label: 'Enrollment confirmation', desc: 'When you enroll in a new course' },
              { key: 'newLesson',    label: 'New lesson available',    desc: 'When an instructor adds a lesson' },
              { key: 'announcement', label: 'Announcements',           desc: 'Platform-wide announcements' },
              { key: 'certificate',  label: 'Certificate earned',      desc: 'When you complete a course' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{desc}</p>
                </div>
                <button
                  onClick={() => toggleNotif(key)}
                  className="relative flex-shrink-0 rounded-full transition-colors"
                  style={{
                    width: 40,
                    height: 22,
                    backgroundColor: notifPrefs[key] ? 'var(--color-ink)' : 'var(--color-border)',
                    transition: `background-color 220ms cubic-bezier(${ease.outExpo.join(',')})`,
                  }}
                  role="switch"
                  aria-checked={notifPrefs[key]}
                  aria-label={label}
                >
                  <span
                    className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm"
                    style={{
                      transform: notifPrefs[key] ? 'translateX(20px)' : 'translateX(2px)',
                      transition: `transform 220ms cubic-bezier(${ease.outExpo.join(',')})`,
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
