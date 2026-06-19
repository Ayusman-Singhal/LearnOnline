# LearnOnline

Full-stack LMS — browse courses, enroll, learn, earn certificates.

## Stack

- **Frontend**: React 19 + Vite 8, Tailwind CSS v4, TanStack Query v5, Clerk auth, Recharts, jsPDF
- **Backend**: Node.js + Express 5, Supabase (PostgreSQL), Stripe + Connect, Cloudinary, Resend
- **Deployment**: Vercel (frontend) + Render (API)

## Local Dev Setup

### Prerequisites

- Node.js 18+
- Accounts: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Cloudinary](https://cloudinary.com), [Stripe](https://stripe.com), [Resend](https://resend.com)

### 1. Clone & install

```bash
git clone <repo-url>
cd LearnOnline

cd server && npm install
cd ../client && npm install
```

### 2. Environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in all values. See `.env.example` files for required keys.

### 3. Database migration

Run once in Supabase SQL editor:

```sql
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS progress_percent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_lesson_id uuid REFERENCES lessons(id);
```

### 4. Run

```bash
# Terminal 1 — API (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

## Features

| Role | Features |
|---|---|
| **Student** | Browse & search courses, free preview on course detail, enroll (free/paid/coupon), watch videos, read PDFs, mark lessons complete, take quizzes, generate + download PDF certificates, track progress per course |
| **Instructor** | Create & publish courses, add lessons (video/image/PDF/text via Cloudinary), add quizzes with questions, view enrolled students, Stripe Connect payouts (88% share) |
| **Admin** | Manage users & roles, moderate courses, post announcements, view platform analytics (enrollment trend, role breakdown, top courses, revenue split) |

## Routes

| Path | Page |
|---|---|
| `/` | Landing page |
| `/courses` | Browse & search courses |
| `/courses/:id` | Course detail + free lesson preview |
| `/certificates/:certNumber` | Public certificate verification |
| `/about` | About |
| `/blog` | Blog |
| `/careers` | Careers |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/refund` | Refund policy |
| `/dashboard` | Role-based dashboard (student/instructor/admin) |
| `/dashboard/learn/:courseId` | Lesson viewer + quiz + certificate |

## Payment Testing (Stripe test mode)

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | 3D Secure |

Any future expiry, any 3-digit CVC.

**Test coupon**: `skillinabox` — 90% off, single use per account.

## Deployment

### Frontend → Vercel

1. Import repo, set root directory to `client`
2. Add env vars from `client/.env.example`
3. `vercel.json` handles SPA routing automatically

### Backend → Render

1. New Web Service, root directory `server`
2. Build: `npm install` · Start: `node src/index.js`
3. Add env vars from `server/.env.example`
4. Register Render URL as Stripe webhook in [Stripe dashboard](https://dashboard.stripe.com/webhooks) → path `/api/webhooks`

## Project Structure

```
LearnOnline/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/        # Navbar, Sidebar, DashboardLayout, Footer, StaticLayout
│   │   ├── hooks/             # useUser, useApi
│   │   ├── pages/             # Route-level components + static pages
│   │   └── lib/               # utils
│   └── vercel.json
├── server/
│   └── src/
│       ├── routes/            # API route handlers (15 routers)
│       ├── middleware/        # auth.js — requireAuth, requireRole
│       ├── lib/               # supabase, stripe, cloudinary, resend, emails
│       └── services/          # webhookHandlers.js
├── render.yaml
└── PLAN.md
```

## Known Limitations (test mode)

- Resend `FROM` address is `onboarding@resend.dev` — only delivers to the Resend account's verified email in free tier. Add a custom domain for broader delivery.
- Stripe webhook requires `stripe listen --forward-to localhost:5000/api/webhooks` in dev, or use the `/api/orders/confirm` fallback that runs automatically after payment success.
- `APP_URL` in `server/.env` must point to the deployed frontend for email links to work correctly.
