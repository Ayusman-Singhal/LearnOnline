const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// GET /api/analytics/admin — platform overview stats + trends
router.get('/admin', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const [usersRes, coursesRes, enrollmentsRes, revenueRes] = await Promise.all([
      supabase.from('users').select('id, role, created_at', { count: 'exact' }).is('deleted_at', null),
      supabase.from('courses').select('id, title, status', { count: 'exact' }),
      supabase.from('enrollments').select('id, course_id, enrolled_at').eq('status', 'active'),
      supabase.from('platform_fees').select('platform_fee, instructor_share, course_id').neq('status', 'refunded'),
    ])

    const platform_revenue = revenueRes.data?.reduce((s, r) => s + Number(r.platform_fee), 0) || 0
    const total_instructor_share = revenueRes.data?.reduce((s, r) => s + Number(r.instructor_share), 0) || 0
    const published_courses = coursesRes.data?.filter((c) => c.status === 'published').length || 0

    // Enrollments per day for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const recentEnrollments = (enrollmentsRes.data || []).filter((e) => e.enrolled_at >= thirtyDaysAgo)
    const enrollmentsByDay = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      enrollmentsByDay[key] = 0
    }
    for (const e of recentEnrollments) {
      const key = e.enrolled_at?.slice(0, 10)
      if (key && enrollmentsByDay[key] !== undefined) enrollmentsByDay[key]++
    }
    const enrollment_trend = Object.entries(enrollmentsByDay).map(([date, count]) => ({ date, count }))

    // Top courses by enrollment count
    const courseEnrollCount = {}
    for (const e of (enrollmentsRes.data || [])) {
      courseEnrollCount[e.course_id] = (courseEnrollCount[e.course_id] || 0) + 1
    }
    const top_courses = (coursesRes.data || [])
      .map((c) => ({ id: c.id, title: c.title, status: c.status, enrollments: courseEnrollCount[c.id] || 0 }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5)

    // User role breakdown
    const role_counts = {}
    for (const u of (usersRes.data || [])) {
      role_counts[u.role] = (role_counts[u.role] || 0) + 1
    }

    res.json({
      total_users: usersRes.count || 0,
      total_courses: coursesRes.count || 0,
      published_courses,
      total_enrollments: enrollmentsRes.data?.length || 0,
      platform_revenue,
      total_instructor_share,
      enrollment_trend,
      top_courses,
      role_counts,
    })
  } catch (err) { next(err) }
})

// GET /api/analytics/instructor — instructor's own stats
router.get('/instructor', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, status')
      .eq('instructor_id', req.user.id)

    const ids = courses?.map((c) => c.id) || []

    const [enrollmentsRes, feesRes] = await Promise.all([
      ids.length
        ? supabase.from('enrollments').select('course_id, enrolled_at').in('course_id', ids).eq('status', 'active')
        : { data: [] },
      ids.length
        ? supabase.from('platform_fees').select('instructor_share, status, course_id').in('course_id', ids)
        : { data: [] },
    ])

    const total_earnings = feesRes.data
      ?.filter((f) => f.status !== 'refunded')
      .reduce((s, f) => s + Number(f.instructor_share), 0) || 0

    // Students per course
    const perCourse = {}
    for (const e of (enrollmentsRes.data || [])) {
      perCourse[e.course_id] = (perCourse[e.course_id] || 0) + 1
    }
    const courses_with_counts = (courses || []).map((c) => ({
      ...c, student_count: perCourse[c.id] || 0,
    }))

    res.json({
      courses: courses_with_counts,
      total_students: enrollmentsRes.data?.length || 0,
      total_earnings,
      enrollments_by_course: enrollmentsRes.data || [],
    })
  } catch (err) { next(err) }
})

module.exports = router
