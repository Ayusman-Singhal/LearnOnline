import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { List, Bell } from '@phosphor-icons/react'
import { DesktopSidebar, MobileSidebar } from './Sidebar'
import { useUser } from '../../hooks/useUser'
import { Toaster } from 'sonner'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, role, isLoaded } = useUser()
  const location = useLocation()
  const isLearn = location.pathname.startsWith('/dashboard/learn/')

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-canvas)]">
      <DesktopSidebar role={role} user={user} />
      <MobileSidebar role={role} user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col min-w-0${isLearn ? ' overflow-hidden h-screen' : ''}`}>
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--color-canvas)] border-b border-[var(--color-border)] sticky top-0 z-[30]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-dim)] text-[var(--color-ink-muted)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Open sidebar"
          >
            <List size={18} weight="bold" />
          </button>

          {/* Mini wordmark */}
          <div className="relative w-7 h-7 rounded-[8px] bg-[var(--color-ink)] flex items-center justify-center overflow-hidden">
            <span
              className="font-black text-white text-[13px] leading-none"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              L
            </span>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--color-accent)] rounded-tl-sm" />
          </div>

          <button
            className="p-2 rounded-lg hover:bg-[var(--color-surface-dim)] text-[var(--color-ink-muted)] transition-colors relative focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
        </header>

        {/* Main content */}
        <main className={isLearn ? 'flex-1 overflow-hidden' : 'flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto'}>
          {isLoaded ? (
            <Outlet />
          ) : isLearn ? null : (
            // Skeleton that matches editorial tone
            <div className="space-y-4 animate-pulse">
              <div className="h-7 bg-[var(--color-border)] rounded-xl w-1/3" />
              <div className="h-4 bg-[var(--color-border-soft)] rounded-lg w-1/2" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-[var(--color-border-soft)] rounded-2xl" />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-ink)',
          },
        }}
      />
    </div>
  )
}
