const resend = require('./resend')

const FROM = 'LearnOnline <onboarding@resend.dev>'

async function sendEnrollmentEmail({ to, studentName, courseTitle }) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: `You're enrolled in "${courseTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#1d4ed8;margin:0 0 8px">Welcome to the course!</h2>
        <p style="color:#3f3f46;margin:0 0 16px">Hi ${studentName},</p>
        <p style="color:#3f3f46;margin:0 0 16px">You're now enrolled in <strong>${courseTitle}</strong>. Start learning at your own pace.</p>
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard/my-courses"
           style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Go to my courses
        </a>
        <p style="color:#a1a1aa;font-size:12px;margin-top:32px">LearnOnline · You enrolled in this course</p>
      </div>
    `,
  })
}

async function sendCertificateEmail({ to, studentName, courseTitle, certNumber }) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your certificate for "${courseTitle}" is ready`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#059669;margin:0 0 8px">Congratulations!</h2>
        <p style="color:#3f3f46;margin:0 0 16px">Hi ${studentName},</p>
        <p style="color:#3f3f46;margin:0 0 16px">You've completed <strong>${courseTitle}</strong> and your certificate is ready.</p>
        <p style="color:#6b7280;font-size:13px;margin:0 0 20px">Certificate ID: <strong style="font-family:monospace;color:#2563eb">${certNumber}</strong></p>
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard/certificates"
           style="display:inline-block;background:#059669;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          View certificate
        </a>
        <p style="color:#a1a1aa;font-size:12px;margin-top:32px">LearnOnline · Keep learning!</p>
      </div>
    `,
  })
}

async function sendQuizResultEmail({ to, studentName, courseTitle, score, passed }) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: passed ? `You passed the quiz for "${courseTitle}"!` : `Quiz result for "${courseTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px">
        <h2 style="color:${passed ? '#059669' : '#dc2626'};margin:0 0 8px">${passed ? 'Quiz passed!' : 'Quiz result'}</h2>
        <p style="color:#3f3f46;margin:0 0 16px">Hi ${studentName},</p>
        <p style="color:#3f3f46;margin:0 0 16px">You scored <strong>${score}%</strong> on the quiz for <strong>${courseTitle}</strong>.</p>
        ${passed
          ? '<p style="color:#059669;font-weight:600">You can now generate your certificate!</p>'
          : '<p style="color:#6b7280">Keep practicing you can retry if retakes are allowed.</p>'}
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard/my-courses"
           style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Go to course
        </a>
        <p style="color:#a1a1aa;font-size:12px;margin-top:32px">LearnOnline</p>
      </div>
    `,
  })
}

module.exports = { sendEnrollmentEmail, sendCertificateEmail, sendQuizResultEmail }
