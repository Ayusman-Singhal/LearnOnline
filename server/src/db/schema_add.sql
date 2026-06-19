-- Migration 001 — Fix schema/route mismatches
-- Run in Supabase SQL Editor after schema.sql

-- 1. Replace is_published with status enum on courses
create type course_status as enum ('draft', 'published', 'archived');
alter table courses drop column is_published;
alter table courses add column status course_status not null default 'draft';
create index idx_courses_status on courses (status);

-- 2. Add target_role to announcements (routes already send it)
create type announcement_target as enum ('all', 'student', 'instructor');
alter table announcements add column target_role announcement_target not null default 'all';
-- author_id already exists — routes use 'created_by' alias, fixed in route below
