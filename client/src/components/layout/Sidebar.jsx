import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useClerk } from '@clerk/clerk-react'
import {
  House,
  BookOpen,
  ChartLineUp,
  Certificate,
  Users,
  Megaphone,
  Gear,
  SignOut,
  VideoCamera,
  Wallet,
  Bank,
  X,
  ArrowSquareOut,
} from '@phosphor-icons/react'
import { ease, dur } from '../../lib/motion'
import { cn } from '../../lib/utils'

const NAV_BY_ROLE = {
  student: [
    { label: 'Dashboard',    href: '/dashboard',              icon: House,         exact: true },
    { label: 'My Courses',   href: '/dashboard/my-courses',   icon: BookOpen },
    { label: 'Browse',       href: '/dashboard/browse',       icon: VideoCamera },
    { label: 'Progress',     href: '/dashboard/progress',     icon: ChartLineUp },
    { label: 'Certificates', href: '/dashboard/certificates', icon: Certificate },
  ],
  instructor: [
    { label: 'Dashboard',    href: '/dashboard',              icon: House,  exact: true },
    { label: 'My Courses',   href: '/dashboard/courses',      icon: BookOpen },
    { label: 'Students',     href: '/dashboard/students',     icon: Users },
    { label: 'Earnings',     href: '/dashboard/earnings',     icon: Wallet },
    { label: 'Payouts',      href: '/dashboard/onboarding',   icon: Bank },
  ],
  admin: [
    { label: 'Dashboard',    href: '/dashboard',              icon: House,     exact: true },
    { label: 'Users',        href: '/dashboard/users',        icon: Users },
    { label: 'Courses',      href: '/dashboard/admin-courses',icon: BookOpen },
    { label: 'Announcements',href: '/dashboard/announcements',icon: Megaphone },
    { label: 'Analytics',    href: '/dashboard/analytics',    icon: ChartLineUp },
  ],
}

function NavItem({ item }) {
  return (
    <NavLink
      to={item.href}
      end={item.exact}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
          'transition-all duration-150 outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
          isActive
            ? 'bg-[var(--color-ink)] text-white shadow-sm'
            : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-dim)]'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon size={16} weight={isActive ? 'fill' : 'regular'} />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

/** Wordmark for sidebar */
function SidebarWordmark() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--color-border-soft)] hover:bg-[var(--color-surface-dim)] transition-colors"
    >
      <div className="relative w-7 h-7 rounded-[8px] bg-[var(--color-ink)] flex items-center justify-center overflow-hidden flex-shrink-0">
        <span
          className="font-black text-white text-[13px] leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          L
        </span>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--color-accent)] rounded-tl-sm" />
      </div>
      <span className="font-semibold text-[var(--color-ink)] text-[13px] truncate tracking-tight">
        LearnOnline
      </span>
    </Link>
  )
}

export function DesktopSidebar({ role = 'student', user }) {
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.student

  return (
    <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-[var(--color-canvas)] border-r border-[var(--color-border)] h-screen sticky top-0">
      <SidebarWordmark />

      {/* User */}
      {user && (
        <div className="px-4 py-3 border-b border-[var(--color-border-soft)]">
          <div className="flex items-center gap-2.5">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                <span className="text-[var(--color-accent)] text-xs font-bold">
                  {user.name?.[0] || 'U'}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--color-ink)] truncate">
                {user.name || 'User'}
              </p>
              <p className="text-[10px] text-[var(--color-ink-muted)] capitalize">{role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Role label */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[10px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-[0.15em]">
          {role === 'student' ? 'Learning' : role === 'instructor' ? 'Teaching' : 'Admin'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 flex flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => <NavItem key={item.href} item={item} />)}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[var(--color-border-soft)] flex flex-col gap-0.5">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-dim)] transition-colors"
        >
          <ArrowSquareOut size={16} />
          <span>Main site</span>
        </Link>
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            isActive
              ? 'bg-[var(--color-ink)] text-white'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-dim)]'
          )}
        >
          <Gear size={16} />
          <span>Settings</span>
        </NavLink>
        <button
          onClick={() => signOut(() => navigate('/'))}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] transition-colors w-full text-left"
        >
          <SignOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

export function MobileSidebar({ role = 'student', user, open, onClose }) {
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.student

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur.fast }}
            className="fixed inset-0 z-[40] bg-[var(--color-ink)]/30 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="sidebar"
            initial={reduce ? false : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: dur.moderate, ease: ease.spring }}
            className="fixed left-0 top-0 bottom-0 z-[50] w-64 bg-[var(--color-canvas)] border-r border-[var(--color-border)] flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--color-border-soft)]">
              <div className="flex items-center gap-2.5">
                <div className="relative w-7 h-7 rounded-[8px] bg-[var(--color-ink)] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <span
                    className="font-black text-white text-[13px] leading-none tracking-tight"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    L
                  </span>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--color-accent)] rounded-tl-sm" />
                </div>
                <span className="font-semibold text-[var(--color-ink)] text-[13px]">LearnOnline</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-dim)] text-[var(--color-ink-muted)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                aria-label="Close sidebar"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Role label */}
            <div className="px-4 pt-4 pb-1">
              <span className="text-[10px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-[0.15em]">
                {role === 'student' ? 'Learning' : role === 'instructor' ? 'Teaching' : 'Admin'}
              </span>
            </div>

            <nav className="flex-1 px-3 pb-4 flex flex-col gap-0.5 overflow-y-auto">
              {items.map((item) => (
                <div key={item.href} onClick={onClose}>
                  <NavItem item={item} />
                </div>
              ))}
            </nav>

            <div className="px-3 py-4 border-t border-[var(--color-border-soft)] flex flex-col gap-0.5">
              <Link
                to="/"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-dim)] transition-colors"
              >
                <ArrowSquareOut size={16} />
                <span>Main site</span>
              </Link>
              <NavLink
                to="/dashboard/settings"
                onClick={onClose}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-ink)] text-white'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-dim)]'
                )}
              >
                <Gear size={16} />
                <span>Settings</span>
              </NavLink>
              <button
                onClick={() => signOut(() => navigate('/'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] transition-colors w-full text-left"
              >
                <SignOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
