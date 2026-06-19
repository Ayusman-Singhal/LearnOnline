import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Navbar from './components/layout/Navbar'
import DashboardLayout from './components/layout/DashboardLayout'
import LandingPage from './pages/LandingPage'
import CoursesPage from './pages/CoursesPage'
import SignInPage from './pages/auth/SignInPage'
import SignUpPage from './pages/auth/SignUpPage'
import CourseDetailPage from './pages/CourseDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import MyCoursesPage from './pages/dashboard/student/MyCoursesPage'
import LearnPage from './pages/dashboard/student/LearnPage'
import CertificatesPage from './pages/dashboard/student/CertificatesPage'
import ProgressPage from './pages/dashboard/student/ProgressPage'
import CertificateVerifyPage from './pages/CertificateVerifyPage'
import InstructorDashboard from './pages/dashboard/InstructorDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import SettingsPage from './pages/dashboard/SettingsPage'
import ComingSoonPage from './pages/dashboard/ComingSoonPage'
import UsersPage from './pages/dashboard/admin/UsersPage'
import AnalyticsPage from './pages/dashboard/admin/AnalyticsPage'
import AnnouncementsPage from './pages/dashboard/admin/AnnouncementsPage'
import CoursesAdminPage from './pages/dashboard/admin/CoursesAdminPage'
import InstructorCoursesPage from './pages/dashboard/instructor/CoursesPage'
import CourseEditPage from './pages/dashboard/instructor/CourseEditPage'
import InstructorStudentsPage from './pages/dashboard/instructor/StudentsPage'
import EarningsPage from './pages/dashboard/instructor/EarningsPage'
import OnboardingPage from './pages/dashboard/instructor/OnboardingPage'
import WelcomePage from './pages/dashboard/WelcomePage'
import AboutPage from './pages/AboutPage'
import BlogPage from './pages/BlogPage'
import CareersPage from './pages/CareersPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import RefundPage from './pages/RefundPage'
import { useUser } from './hooks/useUser'

function DashboardHome() {
  const { role, isLoaded, clerkUser } = useUser()
  if (!isLoaded) return null

  // Show role picker for users who haven't been welcomed yet
  const welcomed = localStorage.getItem('welcomed')
  if (!welcomed || welcomed !== clerkUser?.id) {
    return <WelcomePage />
  }

  if (role === 'admin') return <AdminDashboard />
  if (role === 'instructor') return <InstructorDashboard />
  return <StudentDashboard />
}

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!isSignedIn) return <Navigate to="/sign-in" replace />
  return children
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/certificates/:certNumber" element={<CertificateVerifyPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund" element={<RefundPage />} />

        {/* Protected dashboard — Outlet pattern */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />

          {/* Student */}
          <Route path="my-courses" element={<MyCoursesPage />} />
          <Route path="learn/:courseId" element={<LearnPage />} />
          <Route path="browse" element={<CoursesPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="certificates" element={<CertificatesPage />} />

          {/* Instructor */}
          <Route path="courses" element={<InstructorCoursesPage />} />
          <Route path="courses/:courseId/edit" element={<CourseEditPage />} />
          <Route path="students" element={<InstructorStudentsPage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />

          {/* Admin */}
          <Route path="users" element={<UsersPage />} />
          <Route path="admin-courses" element={<CoursesAdminPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />

          {/* Shared */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
