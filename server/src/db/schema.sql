-- LearnOnline — Supabase SQL Schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- No RLS: all access via Express service-role key

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────
create type user_role as enum ('student', 'instructor', 'admin');
create type enrollment_status as enum ('active', 'refunded', 'revoked');
create type fee_status as enum ('pending_transfer', 'transferred', 'refunded');
create type transfer_status as enum ('pending', 'settled', 'reversed', 'failed');
create type lesson_type as enum ('video', 'pdf', 'image', 'text');
create type material_type as enum ('pdf', 'image', 'link', 'zip');
create type account_status as enum ('pending', 'active', 'restricted');

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
create table users (
  id              uuid primary key default gen_random_uuid(),
  clerk_id        text unique not null,
  email           text unique not null,
  name            text not null default '',
  avatar_url      text,
  role            user_role not null default 'student',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz  -- soft delete
);

create index idx_users_clerk_id on users (clerk_id);
create index idx_users_role on users (role);

-- ─────────────────────────────────────────────
-- INSTRUCTORS (instructor-specific profile)
-- ─────────────────────────────────────────────
create table instructors (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references users (id) on delete cascade,
  bio                 text,
  headline            text,
  stripe_account_id   text unique,          -- Stripe Express connected account
  stripe_onboard_status account_status not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id)
);

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  icon        text,
  created_at  timestamptz not null default now()
);

insert into categories (name, slug) values
  ('Development', 'development'),
  ('Design', 'design'),
  ('Data Science', 'data-science'),
  ('Business', 'business'),
  ('Marketing', 'marketing');

-- ─────────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────────
create table courses (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text unique not null,
  description     text,
  price           numeric(10, 2) not null default 0,
  instructor_id   uuid not null references users (id),
  category_id     uuid references categories (id),
  thumbnail_url   text,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_courses_instructor on courses (instructor_id);
create index idx_courses_category on courses (category_id);
create index idx_courses_published on courses (is_published);

-- ─────────────────────────────────────────────
-- LESSONS
-- ─────────────────────────────────────────────
create table lessons (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references courses (id) on delete cascade,
  title           text not null,
  sort_order      int not null default 0,
  type            lesson_type not null default 'video',
  content_url     text,
  duration_mins   int,
  is_free         boolean not null default false,  -- preview without enrollment
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_lessons_course on lessons (course_id, sort_order);

-- ─────────────────────────────────────────────
-- LEARNING MATERIALS (attachments per lesson)
-- ─────────────────────────────────────────────
create table learning_materials (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references lessons (id) on delete cascade,
  title       text not null,
  type        material_type not null,
  url         text not null,
  created_at  timestamptz not null default now()
);

create index idx_materials_lesson on learning_materials (lesson_id);

-- ─────────────────────────────────────────────
-- ENROLLMENTS
-- ─────────────────────────────────────────────
create table enrollments (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references users (id),
  course_id   uuid not null references courses (id),
  payment_id  text,                           -- Stripe PaymentIntent ID
  status      enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create index idx_enrollments_student on enrollments (student_id);
create index idx_enrollments_course on enrollments (course_id);

-- ─────────────────────────────────────────────
-- QUIZZES
-- ─────────────────────────────────────────────
create table quizzes (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses (id) on delete cascade,
  title         text not null,
  passing_score int not null default 70,      -- percentage
  allow_retry   boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (course_id)                          -- one quiz per course
);

-- ─────────────────────────────────────────────
-- QUESTIONS
-- ─────────────────────────────────────────────
create table questions (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references quizzes (id) on delete cascade,
  question        text not null,
  options         jsonb not null,             -- ["opt A", "opt B", "opt C", "opt D"]
  correct_index   int not null,               -- 0-based index into options
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

create index idx_questions_quiz on questions (quiz_id, sort_order);

-- ─────────────────────────────────────────────
-- QUIZ ATTEMPTS
-- ─────────────────────────────────────────────
create table quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references quizzes (id),
  student_id   uuid not null references users (id),
  score        int not null,                  -- percentage 0-100
  passed       boolean not null,
  answers      jsonb not null,                -- { question_id: chosen_index }
  attempted_at timestamptz not null default now()
);

create index idx_attempts_student_quiz on quiz_attempts (student_id, quiz_id);

-- ─────────────────────────────────────────────
-- LESSON PROGRESS
-- ─────────────────────────────────────────────
create table lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references users (id),
  lesson_id    uuid not null references lessons (id),
  course_id    uuid not null references courses (id),
  completed_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create index idx_progress_student_course on lesson_progress (student_id, course_id);

-- ─────────────────────────────────────────────
-- CERTIFICATES
-- ─────────────────────────────────────────────
create table certificates (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references users (id),
  course_id   uuid not null references courses (id),
  cert_number text unique not null default 'LO-' || upper(substr(gen_random_uuid()::text, 1, 8)),
  pdf_url     text,
  issued_at   timestamptz not null default now(),
  unique (student_id, course_id)
);

-- ─────────────────────────────────────────────
-- ANNOUNCEMENTS
-- ─────────────────────────────────────────────
create table announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  author_id   uuid not null references users (id),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- COUPONS
-- ─────────────────────────────────────────────
create table coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null,
  discount_percent int not null check (discount_percent between 1 and 100),
  is_active        boolean not null default true,
  max_uses         int,                        -- null = unlimited
  used_count       int not null default 0,
  created_at       timestamptz not null default now()
);

-- Seed the dev coupon
insert into coupons (code, discount_percent, is_active)
values ('skillinabox', 90, true);

-- ─────────────────────────────────────────────
-- COUPON USES
-- ─────────────────────────────────────────────
create table coupon_uses (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid not null references coupons (id),
  student_id  uuid not null references users (id),
  payment_id  text,
  used_at     timestamptz not null default now(),
  unique (coupon_id, student_id)               -- one use per user per coupon
);

-- ─────────────────────────────────────────────
-- PLATFORM FEES
-- ─────────────────────────────────────────────
create table platform_fees (
  id               uuid primary key default gen_random_uuid(),
  payment_id       text not null,              -- Stripe PaymentIntent ID
  course_id        uuid not null references courses (id),
  student_id       uuid not null references users (id),
  instructor_id    uuid not null references users (id),
  gross            numeric(10, 2) not null,
  platform_fee     numeric(10, 2) not null,    -- 12%
  instructor_share numeric(10, 2) not null,    -- 88%
  status           fee_status not null default 'pending_transfer',
  transfer_id      text,                       -- Stripe Transfer ID (set after transfer)
  created_at       timestamptz not null default now()
);

create index idx_fees_instructor on platform_fees (instructor_id);
create index idx_fees_payment on platform_fees (payment_id);

-- ─────────────────────────────────────────────
-- INSTRUCTOR TRANSFERS
-- ─────────────────────────────────────────────
create table instructor_transfers (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references users (id),
  payment_id    text not null,                 -- Stripe PaymentIntent ID
  transfer_id   text unique,                   -- Stripe Transfer ID
  amount        numeric(10, 2) not null,
  status        transfer_status not null default 'pending',
  settled_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_transfers_instructor on instructor_transfers (instructor_id);
create index idx_transfers_transfer_id on instructor_transfers (transfer_id);

-- ─────────────────────────────────────────────
-- updated_at trigger (apply to tables that have it)
-- ─────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

create trigger trg_courses_updated_at
  before update on courses
  for each row execute function set_updated_at();

create trigger trg_lessons_updated_at
  before update on lessons
  for each row execute function set_updated_at();

create trigger trg_instructors_updated_at
  before update on instructors
  for each row execute function set_updated_at();
