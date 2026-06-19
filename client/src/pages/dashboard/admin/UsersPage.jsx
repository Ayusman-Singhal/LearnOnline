import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MagnifyingGlass, Trash, CaretDown } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useApi } from '../../../hooks/useApi'

const ROLES = ['student', 'instructor', 'admin']

const ROLE_BADGE = {
  student: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  instructor: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  admin: 'bg-[var(--color-canvas)] text-[var(--color-ink)]',
}

export default function UsersPage() {
  const reduce = useReducedMotion()
  const api = useApi()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/api/users'),
  })

  const changeRole = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/api/users/${id}/role`, { role }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'users']); toast.success('Role updated') },
    onError: (e) => toast.error(e.message),
  })

  const deleteUser = useMutation({
    mutationFn: (id) => api.del(`/api/users/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin', 'users']); toast.success('User removed') },
    onError: (e) => toast.error(e.message),
  })

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">Users</h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">{users.length} total accounts</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
          <input
            type="search"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-ink)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer"
          >
            <option value="all">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <CaretDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
      >
        {isLoading ? (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[var(--color-canvas)]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-[var(--color-canvas)] rounded w-32" />
                  <div className="h-3 bg-[var(--color-canvas)] rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[var(--color-ink-muted)] text-sm py-12">No users found</p>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {filtered.map((user) => (
              <div key={user.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--color-canvas)] transition-colors group">
                <div className="w-8 h-8 rounded-full bg-[var(--color-canvas)] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[var(--color-ink-muted)]">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-ink)] text-sm truncate">{user.name || 'Unnamed'}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] truncate">{user.email}</p>
                </div>

                {/* Role selector */}
                <div className="relative flex-shrink-0">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole.mutate({ id: user.id, role: e.target.value })}
                    className={`appearance-none pl-2.5 pr-6 py-1 rounded-full text-[11px] font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${ROLE_BADGE[user.role]}`}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <CaretDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (window.confirm(`Remove ${user.name}? This cannot be undone.`)) {
                      deleteUser.mutate(user.id)
                    }
                  }}
                  className="p-1.5 rounded-lg text-[var(--color-ink-faint)] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  aria-label="Delete user"
                >
                  <Trash size={15} />
                </button>

                <span className="text-xs text-[var(--color-ink-muted)] hidden lg:block flex-shrink-0 w-24 text-right">
                  {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
