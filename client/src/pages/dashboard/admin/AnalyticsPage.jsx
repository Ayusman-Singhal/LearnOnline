import { motion, useReducedMotion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, BookOpen, Student, CurrencyInr, ChartBar, ChartPie,
} from '@phosphor-icons/react'
import { useApi } from '../../../hooks/useApi'
import { ease, dur, spring } from '../../../lib/motion'
import { cn } from '../../../lib/utils'

// Editorial palette for recharts
const ACCENT   = '#B8553A'  // terracotta
const INK      = '#1A1714'  // ink
const SUCCESS  = '#4A7C59'  // muted forest
const AMBER    = '#C4862E'  // warm amber
const MUTED    = '#8A8175'  // ink-muted

const ROLE_COLORS = { student: ACCENT, instructor: SUCCESS, admin: MUTED }
const PIE_COLORS  = [ACCENT, SUCCESS, MUTED, AMBER, INK]

const STAT_CARDS = (d) => [
  { label: 'Total users',       value: d.total_users,           icon: Users,       colorClass: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
  { label: 'Published courses', value: d.published_courses,     icon: BookOpen,    colorClass: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' },
  { label: 'Enrollments',       value: d.total_enrollments,     icon: Student,     colorClass: 'bg-amber-50 text-amber-600' },
  { label: 'Platform revenue',  value: `₹${d.platform_revenue?.toFixed(2) || '0.00'}`, icon: CurrencyInr, colorClass: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
]

function StatCard({ label, value, icon: Icon, colorClass, index }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring.soft, delay: index * 0.07 }}
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 flex items-center gap-4"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
        <Icon size={20} weight="fill" />
      </div>
      <div>
        <p
          className="text-2xl font-black text-[var(--color-ink)] tabular-nums"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {value}
        </p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-[var(--color-ink-muted)] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold tabular-nums">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const reduce = useReducedMotion()
  const api = useApi()

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'admin'],
    queryFn: () => api.get('/api/analytics/admin'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 animate-pulse h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 animate-pulse h-60" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-12 text-center">
        <p className="text-[var(--color-ink-muted)]">Failed to load analytics.</p>
      </div>
    )
  }

  const roleData = Object.entries(data.role_counts || {}).map(([name, value]) => ({ name, value }))

  const trendData = (data.enrollment_trend || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

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
          Analytics
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">Platform overview · last 30 days</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS(data).map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* Revenue summary */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.slow, delay: 0.28, ease: ease.outExpo }}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 mb-6 flex flex-wrap gap-6"
      >
        <div>
          <p className="text-xs text-[var(--color-ink-muted)] font-semibold uppercase tracking-[0.08em] mb-1">Gross revenue</p>
          <p
            className="text-xl font-black text-[var(--color-ink)] tabular-nums"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            ₹{((data.platform_revenue || 0) + (data.total_instructor_share || 0)).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-ink-muted)] font-semibold uppercase tracking-[0.08em] mb-1">Platform (12%)</p>
          <p
            className="text-xl font-black tabular-nums"
            style={{ fontFamily: 'var(--font-serif)', color: ACCENT }}
          >
            ₹{(data.platform_revenue || 0).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-ink-muted)] font-semibold uppercase tracking-[0.08em] mb-1">Instructors (88%)</p>
          <p
            className="text-xl font-black tabular-nums"
            style={{ fontFamily: 'var(--font-serif)', color: SUCCESS }}
          >
            ₹{(data.total_instructor_share || 0).toFixed(2)}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Enrollment trend */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.slow, delay: 0.32, ease: ease.outExpo }}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <ChartBar size={16} className="text-[var(--color-accent)]" weight="fill" />
            <p className="font-semibold text-[var(--color-ink)] text-sm">Enrollments last 30 days</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="enroll-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D9" />
              <XAxis
                dataKey="date"
                tickFormatter={(v, i) => (i % 5 === 0 ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '')}
                tick={{ fontSize: 10, fill: MUTED }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Enrollments" stroke={ACCENT} strokeWidth={2} fill="url(#enroll-grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User role breakdown */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.slow, delay: 0.36, ease: ease.outExpo }}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <ChartPie size={16} className="text-[var(--color-success)]" weight="fill" />
            <p className="font-semibold text-[var(--color-ink)] text-sm">User breakdown by role</p>
          </div>
          {roleData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-[var(--color-ink-muted)] text-sm">No user data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {roleData.map((entry, i) => (
                    <Cell key={entry.name} fill={ROLE_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Top courses */}
      {data.top_courses?.length > 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.slow, delay: 0.4, ease: ease.outExpo }}
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={16} className="text-amber-600" weight="fill" />
            <p className="font-semibold text-[var(--color-ink)] text-sm">Top courses by enrollment</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.top_courses}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="title"
                width={140}
                tick={{ fontSize: 11, fill: INK }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.length > 20 ? v.slice(0, 18) + '…' : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="enrollments" name="Enrollments" fill={ACCENT} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}
