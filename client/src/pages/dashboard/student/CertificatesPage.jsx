import { motion, useReducedMotion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Certificate, Trophy, Download, ArrowRight, BookOpen } from '@phosphor-icons/react'
import { jsPDF } from 'jspdf'
import { useApi } from '../../../hooks/useApi'
import { useUser } from '../../../hooks/useUser'

function generateCertPDF(cert, studentName) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // Background
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 0, W, H, 'F')

  // Border
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(3)
  doc.rect(8, 8, W - 16, H - 16)
  doc.setLineWidth(0.5)
  doc.rect(11, 11, W - 22, H - 22)

  // Header
  doc.setTextColor(37, 99, 235)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('LEARNONLINE', W / 2, 28, { align: 'center' })

  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.8)
  doc.line(W / 2 - 40, 32, W / 2 + 40, 32)

  doc.setTextColor(30, 30, 30)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('Certificate of Completion', W / 2, 52, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('This certifies that', W / 2, 64, { align: 'center' })

  // Student name
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(studentName || 'Student', W / 2, 80, { align: 'center' })

  // Underline
  const nameWidth = doc.getTextWidth(studentName || 'Student')
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.5)
  doc.line(W / 2 - nameWidth / 2, 83, W / 2 + nameWidth / 2, 83)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('has successfully completed the course', W / 2, 94, { align: 'center' })

  // Course title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(37, 99, 235)
  const courseTitle = cert.courses?.title || 'Course'
  doc.text(courseTitle, W / 2, 108, { align: 'center', maxWidth: W - 60 })

  // Instructor
  const instructor = cert.courses?.users?.name
  if (instructor) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text(`Instructed by ${instructor}`, W / 2, 120, { align: 'center' })
  }

  // Footer row
  const issued = new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const yFoot = H - 30

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Date of Issue', 40, yFoot - 4)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(issued, 40, yFoot + 2)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Certificate ID', W / 2, yFoot - 4, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(37, 99, 235)
  doc.text(cert.cert_number, W / 2, yFoot + 2, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Platform', W - 40, yFoot - 4, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('LearnOnline', W - 40, yFoot + 2, { align: 'right' })

  doc.save(`certificate-${cert.cert_number}.pdf`)
}

function CertCard({ cert, studentName, index }) {
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const course = cert.courses

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
    >
      {/* Header band */}
      <div className="bg-[var(--color-ink)] px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)]/20 flex items-center justify-center flex-shrink-0">
          <Trophy size={20} weight="fill" className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm leading-tight truncate">{course?.title || 'Course'}</p>
          <p className="text-white/70 text-xs mt-0.5">
            {course?.users?.name ? `by ${course.users.name}` : ''}
          </p>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wide font-semibold">Certificate ID</p>
            <p className="font-mono text-sm font-bold text-[var(--color-accent)] mt-0.5">{cert.cert_number}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wide font-semibold">Issued</p>
            <p className="text-sm text-[var(--color-ink)] mt-0.5">
              {new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => generateCertPDF(cert, studentName)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--color-ink)] text-white text-xs font-semibold hover:bg-[#2A2520] active:scale-[0.98] transition-all"
            style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <Download size={13} /> Download PDF
          </button>
          <button
            onClick={() => navigate(`/certificates/${cert.cert_number}`)}
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)] transition-colors flex items-center gap-1"
          >
            Verify <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function CertificatesPage() {
  const reduce = useReducedMotion()
  const api = useApi()
  const { clerkUser } = useUser()
  const studentName = clerkUser ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() : 'Student'

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ['certificates', 'my'],
    queryFn: () => api.get('/api/certificates/my'),
  })

  return (
    <div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">My certificates</h1>
        <p className="text-[var(--color-ink-muted)] mt-1 text-sm">
          {certs.length > 0
            ? `${certs.length} certificate${certs.length !== 1 ? 's' : ''} earned`
            : 'Complete courses to earn certificates'}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse">
              <div className="h-20 bg-[var(--color-canvas)]" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-32 bg-[var(--color-canvas)] rounded" />
                <div className="h-8 bg-[var(--color-canvas)] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-4">
            <Certificate size={28} className="text-[var(--color-accent)]" weight="fill" />
          </div>
          <p className="font-bold text-[var(--color-ink)] mb-1">No certificates yet</p>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">Complete a course to earn your first certificate</p>
          <button
            onClick={() => window.location.href = '/courses'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] transition-colors"
          >
            <BookOpen size={15} /> Browse courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((cert, i) => (
            <CertCard key={cert.id} cert={cert} studentName={studentName} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
