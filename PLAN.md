# LearnOnline — Implementation Plan

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Authentication | Clerk |
| Media Storage | Cloudinary |
| Payments | Razorpay (test mode) + Route |
| Email | Resend |
| State Management | TanStack Query + Context API |
| Validation | React Hook Form + Zod |
| Charts | Recharts |
| PDF | jsPDF |
| Deployment | Vercel (FE), Render (BE) |

## Payment & Payout

- **Gateway:** Razorpay (test mode) + **Route** (marketplace split)
- **Platform Fee:** 12% retained by platform, 88% transferred to instructor linked account
- **Payout:** Automatic Route transfer at payment capture; Razorpay settles instructor linked accounts on Route schedule — no manual cron needed
- **Instructor Onboarding:** Razorpay Route linked account (`POST /accounts`) + KYC via Razorpay dashboard
- **Refund Policy:** Platform bears gateway fee; refund reverses the Route transfer
- **Coupon:** `skillinabox` — 90% off, single use per user, all courses

## Implementation Phases

### Phase 1 — Project Initialization
- Create React + Vite app
- Create Express API
- Configure Tailwind CSS
- Install shadcn/ui
- ESLint & Prettier
- Git repo
- Environment variables
- Connect FE to BE

### Phase 2 — External Services
- Clerk (dev instance)
- Clerk webhook endpoint (Svix-signed) for user sync
- Supabase (free tier)
- Cloudinary (free tier)
- Razorpay (test keys + Route enabled)
- Resend (dev domain)

### Phase 3 — Database Design

> **Data-access strategy:** All DB access via Express using Supabase **service-role** key. Authorization enforced in API middleware (Phase 4), not Supabase RLS. Service-role key is server-side only — never shipped to client.

**Tables:** Users, Roles, Categories, Courses, Lessons, Learning Materials, Enrollments, Quizzes, Questions, Quiz Attempts, Progress, Certificates, Announcements, Coupons, Platform Fees, Instructor Transfers

Key additions:
- `coupons` — `skillinabox` (90% off, single use per user)
- `platform_fees` — order_id, payment_id, course_id, student_id, instructor_id, gross, platform_fee (12%), instructor_share (88%), status, transfer_id
- `instructor_transfers` — instructor_id, payment_id, transfer_id, amount, status, settled_at
- `instructors` — includes `razorpay_account_id` (Route linked account ID)

### Phase 4 — Authentication & Authorization
- Registration / Login / Logout via Clerk
- User Profile
- Roles: Admin, Instructor, Student
- Protected Routes
- API Authorization Middleware
- **Clerk webhook** (`user.created` / `user.updated` / `user.deleted`) → upsert / soft-delete row in Supabase `users` (clerk_id, email, name, avatar, role). Verify Svix signature using `CLERK_WEBHOOK_SECRET`.

### Phase 5 — Application Layout
- Landing Page
- Navigation Bar
- Auth Pages
- Dashboard Layout + Sidebar
- Responsive Design

### Phase 6 — Admin Module
- Dashboard (users, courses, enrollments stats)
- User Management (CRUD + roles)
- Course Management (view, categories, archive)
- Announcement Management
- Reports

### Phase 7 — Instructor Module
- Dashboard
- Course Management (CRUD + publish)
- Lesson Management (create, PDF, image, video, resources)
- Quiz Management (create, questions, passing score)
- Student Management (enrolled, progress, quiz results)

### Phase 8 — Instructor Onboarding (Razorpay Route)
- Create Route linked account via `POST /accounts` (Razorpay Route API)
- KYC redirect + `account_status` tracking
- Bank details captured by Razorpay (no raw bank data in our DB)
- Earnings dashboard derived from `instructor_transfers` ledger

### Phase 9 — Student Module
- Dashboard
- Browse Courses (search, category filter, details)
- Checkout with Razorpay + coupon support:
  - Backend `POST /orders` → `razorpay.orders.create` (amount after coupon discount, with Route `transfers[]` for 88% split)
  - Client opens Razorpay Checkout with `order_id`
  - On payment success, frontend calls backend verify endpoint; enrollment confirmed by `payment.captured` webhook
- Enrolled Courses
- Learning (videos, lessons, resources, completion)
- Quiz (take, score, retry if enabled)
- Progress (%, completed courses)

### Phase 10 — Progress Tracking
- Lesson completion
- Course completion %
- Last viewed lesson
- Learning history

### Phase 11 — Certificate System
- PDF certificate on completion (all lessons + quiz passed)
- Unique certificate ID
- Download / verification page

### Phase 12 — Media Management
- Course thumbnails, lesson images, PDFs, videos, avatars via Cloudinary

### Phase 13 — Search & Filtering
- Course search
- Category / instructor filter
- Course sorting

### Phase 14 — Notifications
- In-app + Resend email (enrollment, new lesson, announcement, quiz, certificate)

### Phase 15 — Analytics
- Admin: user growth, enrollment trends, popular courses
- Instructor: student progress, quiz performance, statistics
- Student: learning progress, completed courses, certificates

### Phase 16 — Settings
- Update profile
- Change password (via Clerk)
- Profile picture
- Notification preferences

### Phase 17 — Testing & Optimization
- Auth, CRUD, API, responsive, performance, security testing
- Payment E2E (Razorpay test cards: 4111 1111 1111 1111 success, 4000 0000 0000 0002 decline, success@razorpay UPI)
- Route transfer E2E (test split at capture, verify 88/12, refund reverses transfer)
- Coupon flow (apply skillinabox, second use rejected)
- Refund flow (refund → enrollment revoked + Route transfer reversed)

### Phase 18 — Deployment
- Vercel (React), Render (Express), Supabase, Cloudinary, Razorpay webhooks
- Environment variables, domain, SSL, production build

## Razorpay Webhook Events

> **Security:** Verify `X-Razorpay-Signature` (HMAC-SHA256 with `RAZORPAY_WEBHOOK_SECRET`) on every incoming webhook before acting.

| Event | Action |
|-------|--------|
| `payment.captured` | Create enrollment, record platform_fee, create Route transfer (88%) |
| `payment.failed` | Log, notify student |
| `refund.created` | Reverse enrollment + reverse Route transfer, update fee status |
| `transfer.processed` | Mark instructor_transfers settled |
| `transfer.failed` | Flag transfer, alert admin |

## Route Settlement

Transfers auto-created at capture (via order `transfers[]` or `payment.transfer` after capture). Razorpay settles instructor linked accounts per Route schedule. `transfer.processed` webhook updates `instructor_transfers` ledger. No platform-side cron or fund-holding required.

## Environment Variables

```
# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# Resend
RESEND_API_KEY=re_xxx

# Coupon
COUPON_SKILLINABOX_CODE=skillinabox
COUPON_SKILLINABOX_DISCOUNT=90
```

## Implementation Order

1. Project Initialization
2. External Services
3. Database Design
4. Auth & Authorization
5. Application Layout
6. Admin Module
7. Instructor Module
8. Instructor Onboarding (Route Linked Account)
9. Student Module (with checkout + coupon)
10. Progress Tracking
11. Certificate System
12. Media Management
13. Search & Filtering
14. Notifications
15. Analytics
16. Settings
17. Testing & Optimization
18. Deployment
