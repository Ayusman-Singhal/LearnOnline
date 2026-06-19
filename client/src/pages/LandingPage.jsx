import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Certificate,
  ChartLineUp,
  VideoCamera,
  Brain,
  Users,
  Star,
  BookOpen,
  Play,
} from '@phosphor-icons/react'
import Footer from '../components/layout/Footer'
import Reveal from '../components/ui/Reveal'
import { ease, dur, spring, scaleReveal, liftCard } from '../lib/motion'
import { cn } from '../lib/utils'

/* ── Static data ──────────────────────────────────────────────── */
const COURSES = [
  {
    id: 1,
    title: 'Fashion Design Foundations',
    instructor: 'Priya Kapoor',
    rating: 4.9,
    students: 3241,
    price: 1499,
    tag: 'Design',
    img: 'https://picsum.photos/seed/fashion-design-lp/400/240',
  },
  {
    id: 2,
    title: 'UI/UX for Beginners',
    instructor: 'Aarav Mehta',
    rating: 4.8,
    students: 2187,
    price: 1299,
    tag: 'Design',
    img: 'https://picsum.photos/seed/ux-design-lp/400/240',
  },
  {
    id: 3,
    title: 'Web Development Bootcamp',
    instructor: 'Rahul Sharma',
    rating: 4.7,
    students: 4820,
    price: 1199,
    tag: 'Development',
    img: 'https://picsum.photos/seed/webdev-lp/400/240',
  },
]

const SKILLS = [
  'Fashion Design', 'UI/UX Design', 'Web Development', 'Data Science',
  'Digital Marketing', 'Photography', 'Illustration', 'Brand Strategy',
  'Motion Design', 'Video Editing', 'Business', 'Cosmetology',
]

const STATS = [
  { value: '200+', label: 'Courses' },
  { value: '47.2k', label: 'Learners' },
  { value: '93%', label: 'Completion' },
  { value: '4.8', label: 'Avg. rating' },
]

const TESTIMONIALS = [
  {
    quote: "Completed the fashion design program in three weeks. Got freelance clients within two months. The quality of instruction is genuinely exceptional.",
    name: 'Kavitha Rajan',
    role: 'Freelance designer, Chennai',
    img: 'https://picsum.photos/seed/kavitha-rajan/64/64',
  },
  {
    quote: "The UI/UX course changed how I think about design. Practical projects, real feedback, and a certificate that actually means something.",
    name: 'Siddharth Patel',
    role: 'Product designer, Razorpay',
    img: 'https://picsum.photos/seed/siddharth-patel/64/64',
  },
  {
    quote: "I enrolled, completed the program from home, and launched my first client project in 60 days. Worth every rupee.",
    name: 'Ananya Krishnan',
    role: 'Digital illustrator, Freshworks',
    img: 'https://picsum.photos/seed/ananya-krishnan/64/64',
  },
]

/* ── Marquee ──────────────────────────────────────────────────── */
function Marquee() {
  const doubled = [...SKILLS, ...SKILLS]
  return (
    <div className="overflow-hidden border-y border-[var(--color-border)] py-3 bg-[var(--color-surface)]">
      <div className="flex gap-10 animate-marquee whitespace-nowrap">
        {doubled.map((skill, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)] flex-shrink-0"
          >
            <span className="w-px h-3 bg-[var(--color-accent)] opacity-60 inline-block" />
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Section label — editorial rule style (no badge pill) ─────── */
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="w-5 h-px bg-[var(--color-accent)]" aria-hidden />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
        {children}
      </span>
    </div>
  )
}

/* ── Hero course card ─────────────────────────────────────────── */
function HeroCourseCard({ course, className }) {
  return (
    <div className={cn(
      'bg-[var(--color-surface)] rounded-2xl overflow-hidden',
      'border border-[var(--color-border)]',
      'shadow-[0_4px_24px_rgba(26,23,20,0.08)]',
      className
    )}>
      <div className="relative overflow-hidden">
        <img
          src={course.img}
          alt={course.title}
          className="w-full h-28 object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <p
          className="font-semibold text-[var(--color-ink)] text-sm leading-tight mb-1"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {course.title}
        </p>
        <p className="text-[11px] text-[var(--color-ink-muted)] mb-2">{course.instructor}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={11} weight="fill" className="text-amber-500" />
            <span className="text-xs font-semibold text-[var(--color-ink)] tabular-nums">{course.rating}</span>
            <span className="text-[10px] text-[var(--color-ink-faint)] tabular-nums">({course.students.toLocaleString()})</span>
          </div>
          <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">₹{course.price}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Animated headline — characters slide up through clip-path ── */
function AnimatedHeadline({ children, className }) {
  const reduce = useReducedMotion()
  const words = String(children).split(' ')

  if (reduce) {
    return <h1 className={className}>{children}</h1>
  }

  return (
    <h1 className={cn(className, 'overflow-visible')}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: '105%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: dur.reveal,
              delay: wi * 0.07,
              ease: ease.outExpo,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export default function LandingPage() {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      // Section headings — clip-path reveal from bottom on scroll
      gsap.utils.toArray('[data-gsap="heading"]').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          y: 32,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
        })
      })

      // Stat numbers — count up
      gsap.utils.toArray('[data-gsap="stat"]').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          opacity: 0,
          scale: 0.8,
          duration: 0.5,
          ease: 'back.out(1.4)',
        })
      })

      // Bento cards — stagger reveal
      const bentoCards = gsap.utils.toArray('[data-gsap="bento"]')
      if (bentoCards.length) {
        gsap.from(bentoCards, {
          scrollTrigger: { trigger: bentoCards[0], start: 'top 80%', toggleActions: 'play none none none' },
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
        })
      }
    })
    return () => ctx.revert()
  }, [reduce])

  return (
    <div className="min-h-[100dvh] bg-[var(--color-canvas)]">

      {/* ── HERO ── */}
      <section className="pt-36 pb-0 px-4 md:px-6 relative overflow-hidden min-h-[80dvh] flex items-start">
        {/* Subtle grain texture overlay — editorial detail */}
        <div
          className="pointer-events-none select-none absolute inset-0 opacity-[0.025] hidden lg:block"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
          aria-hidden
        />

        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-14 lg:gap-20 items-center pb-16">

            {/* Left — editorial type block */}
            <div>
              {/* Section label — no pill badge */}
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: dur.moderate, delay: 0.1, ease: ease.outExpo }}
              >
                <SectionLabel>Trusted by 47,200+ learners</SectionLabel>
              </motion.div>

              {/* Hero headline — word-by-word clip reveal */}
              <AnimatedHeadline
                className="text-[clamp(3.2rem,7.5vw,5.8rem)] font-black tracking-tight leading-[1.02] text-[var(--color-ink)] mb-7"
                style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.03em' }}
              >
                Skills that shape careers.
              </AnimatedHeadline>

              <motion.p
                className="text-[17px] text-[var(--color-ink-muted)] leading-relaxed max-w-[420px] mb-9"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur.slow, delay: 0.55, ease: ease.outExpo }}
              >
                Expert-led courses in design, tech, and business from home, at your pace, with certificates that matter.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur.slow, delay: 0.65, ease: ease.outExpo }}
              >
                {/* Primary — ink pill with button-in-button icon */}
                <Link
                  to="/courses"
                  className={cn(
                    'group inline-flex items-center gap-2.5',
                    'h-12 pl-6 pr-3 rounded-full',
                    'bg-[#1A1714] text-white text-[13px] font-semibold',
                    'hover:scale-[1.03] active:scale-[0.97]',
                    'shadow-[0_2px_12px_rgba(26,23,20,0.22)]',
                    'hover:shadow-[0_6px_24px_rgba(26,23,20,0.32)]',
                  )}
                  style={{ transition: `all 220ms cubic-bezier(${ease.outExpo.join(',')})` }}
                >
                  Browse courses
                  <span className={cn(
                    'w-7 h-7 rounded-full bg-white/10 flex items-center justify-center',
                    'transition-transform duration-220',
                    'group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-110'
                  )}>
                    <ArrowRight size={12} weight="bold" />
                  </span>
                </Link>

                {/* Secondary — outline */}
                <Link
                  to="/sign-up"
                  className={cn(
                    'inline-flex items-center h-12 px-6 rounded-full',
                    'border border-[var(--color-border)] text-[var(--color-ink)] text-[13px] font-semibold',
                    'hover:bg-[var(--color-surface)] hover:border-[var(--color-ink-faint)]',
                    'active:scale-[0.97]',
                  )}
                  style={{ transition: `all 200ms cubic-bezier(${ease.outExpo.join(',')})` }}
                >
                  Start teaching
                </Link>
              </motion.div>
            </div>

            {/* Right — Z-axis stacked course cards */}
            <div className="relative hidden lg:block">
              <div className="relative h-[360px]">
                {COURSES.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={reduce ? false : { opacity: 0, scale: 0.88, y: 30, rotate: i === 0 ? -3 : i === 2 ? 2 : 0 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: i === 0 ? -2 : i === 2 ? 1.5 : 0 }}
                    transition={{
                      ...spring.soft,
                      delay: 0.6 + i * 0.12,
                    }}
                    className={cn(
                      'absolute w-[210px]',
                      i === 0 && 'left-0 top-0 z-10',
                      i === 1 && 'right-2 top-10 z-20',
                      i === 2 && 'left-14 bottom-0 z-30',
                    )}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                      transition: { ...spring.snappy },
                    }}
                  >
                    <HeroCourseCard course={course} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile horizontal scroll of cards */}
            <div className="lg:hidden flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {COURSES.map((course) => (
                <div key={course.id} className="flex-shrink-0 w-[180px]">
                  <HeroCourseCard course={course} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee />

      {/* ── STATS — numbers count in with scale reveal ── */}
      <section className="py-16 px-4 md:px-6 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--color-border)] rounded-2xl overflow-hidden">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="bg-[var(--color-surface)] flex flex-col items-center justify-center py-10 px-4"
                initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ ...spring.bouncy, delay: i * 0.08 }}
              >
                <p
                  className="text-[clamp(2.5rem,5vw,3.5rem)] font-black text-[var(--color-ink)] leading-none tabular-nums"
                  style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.03em' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-[var(--color-ink-muted)] mt-2 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section className="py-28 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal variant="clipLeft">
            <SectionLabel>Platform</SectionLabel>
          </Reveal>

          <div className="overflow-hidden mb-14">
            <AnimatedHeadline
              className="text-[clamp(2.2rem,5vw,3.8rem)] font-black tracking-tight text-[var(--color-ink)] max-w-xl"
              style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.025em' }}
            >
              Everything you need to learn well.
            </AnimatedHeadline>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large video card */}
            <motion.div
              className="md:col-span-2 group relative min-h-[280px] rounded-2xl overflow-hidden bg-[var(--color-ink)] h-full"
              variants={liftCard}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              custom={0}
            >
              <img
                src="https://picsum.photos/seed/fashion-class-video/700/320"
                alt="HD video lessons"
                className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-35 group-hover:scale-[1.04] transition-all duration-700"
                loading="lazy"
              />
              {/* Grain */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
                aria-hidden
              />
              <div className="relative z-10 p-7 flex flex-col h-full justify-between min-h-[280px]">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/12 flex items-center justify-center">
                  <VideoCamera size={20} weight="fill" className="text-white" />
                </div>
                <div>
                  <p
                    className="text-xl font-black text-white mb-2"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    HD video lessons
                  </p>
                  <p className="text-sm text-white/55 max-w-[280px]">
                    Professional recordings with captions, speed control, and downloadable resources.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Progress tracking — terracotta */}
            <motion.div
              className="min-h-[280px] rounded-2xl bg-[var(--color-accent)] p-7 flex flex-col justify-between h-full"
              variants={liftCard}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              custom={1}
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <ChartLineUp size={20} weight="fill" className="text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  Track your progress
                </p>
                <p className="text-sm text-white/65 mb-5">
                  Visual dashboards with completion and quiz scores.
                </p>
                <div className="space-y-2">
                  {[85, 62, 100].map((pct, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-white rounded-full"
                          initial={reduce ? false : { width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.12, ease: ease.outExpo }}
                        />
                      </div>
                      <span className="text-[11px] text-white/60 w-7 text-right tabular-nums">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Three smaller cards */}
            {[
              {
                icon: Certificate,
                title: 'Verified certificates',
                desc: 'Earn on completion. Share with a unique verification link.',
                bg: 'bg-[var(--color-surface)] border border-[var(--color-border)]',
                iconBg: 'bg-[var(--color-accent-soft)]',
                iconCol: 'text-[var(--color-accent)]',
                textCol: 'text-[var(--color-ink)]',
                descCol: 'text-[var(--color-ink-muted)]',
              },
              {
                icon: Brain,
                title: 'Adaptive quizzes',
                desc: 'Per-lesson tests with retry and passing-score thresholds.',
                bg: 'bg-[var(--color-canvas)] border border-[var(--color-border-soft)]',
                iconBg: 'bg-[var(--color-success-soft)]',
                iconCol: 'text-[var(--color-success)]',
                textCol: 'text-[var(--color-ink)]',
                descCol: 'text-[var(--color-ink-muted)]',
              },
              {
                icon: Users,
                title: 'Instructor tools',
                desc: 'Upload courses, manage students, earn through Stripe payouts.',
                bg: 'bg-[var(--color-ink)]',
                iconBg: 'bg-white/10 border border-white/8',
                iconCol: 'text-white',
                textCol: 'text-white',
                descCol: 'text-white/45',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                className={cn('min-h-[180px] rounded-2xl p-6 flex flex-col justify-between h-full', card.bg)}
                variants={liftCard}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                custom={i + 2}
              >
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', card.iconBg)}>
                  <card.icon size={18} weight="fill" className={card.iconCol} />
                </div>
                <div>
                  <p
                    className={cn('text-[15px] font-black mb-1', card.textCol)}
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {card.title}
                  </p>
                  <p className={cn('text-sm leading-relaxed', card.descCol)}>{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — editorial two-column ── */}
      <section className="py-28 px-4 md:px-6 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 items-start">
            <div>
              <Reveal variant="clipLeft">
                <SectionLabel>Process</SectionLabel>
              </Reveal>
              <div className="overflow-hidden">
                <AnimatedHeadline
                  className="text-[clamp(2.2rem,4.5vw,3.2rem)] font-black tracking-tight text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.025em' }}
                >
                  Four steps to your next skill.
                </AnimatedHeadline>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { step: '01', icon: BookOpen, label: 'Discover', desc: 'Browse 200+ courses across design, tech, and business.' },
                { step: '02', icon: ArrowRight, label: 'Enroll', desc: 'One-step checkout. Coupons accepted.' },
                { step: '03', icon: Play, label: 'Learn', desc: 'HD video, resources, and quizzes at your own pace.' },
                { step: '04', icon: Certificate, label: 'Certify', desc: 'Download and share your verified certificate.' },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  className="border border-[var(--color-border-soft)] rounded-2xl p-5 bg-[var(--color-canvas)] hover:border-[var(--color-border)] transition-colors duration-200"
                  variants={liftCard}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={i}
                  whileHover={{ y: -2, transition: { ...spring.snappy } }}
                >
                  <span className="text-[10px] font-bold text-[var(--color-ink-faint)] tabular-nums tracking-widest">{s.step}</span>
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center my-3">
                    <s.icon size={15} weight="fill" className="text-[var(--color-accent)]" />
                  </div>
                  <p className="font-black text-[var(--color-ink)] mb-1 text-[15px]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {s.label}
                  </p>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — editorial connected panel ── */}
      <section className="py-28 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal variant="clipLeft">
            <SectionLabel>Learners</SectionLabel>
          </Reveal>
          <div className="overflow-hidden mb-14">
            <AnimatedHeadline
              className="text-[clamp(2.2rem,4.5vw,3.2rem)] font-black tracking-tight text-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.025em' }}
            >
              From our learners.
            </AnimatedHeadline>
          </div>

          {/* Single connected panel — editorial style */}
          <div className="grid grid-cols-1 md:grid-cols-3 border border-[var(--color-border)] rounded-2xl overflow-hidden">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className={cn(
                  'p-8 flex flex-col gap-5 bg-[var(--color-surface)]',
                  i < TESTIMONIALS.length - 1 && 'md:border-r border-[var(--color-border)]',
                  i > 0 && 'border-t md:border-t-0 border-[var(--color-border)]',
                )}
                variants={scaleReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={i}
              >
                {/* Large serif quote mark — decorative, not a badge */}
                <span
                  className="text-7xl font-black text-[var(--color-border)] leading-none select-none -mb-3"
                  aria-hidden
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  "
                </span>
                <p className="text-[var(--color-ink)] text-[15px] leading-[1.7] flex-1">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-[var(--color-border-soft)]">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{t.name}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — full-bleed ink block ── */}
      <section className="py-28 px-4 md:px-6 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="relative rounded-3xl bg-[var(--color-ink)] px-8 py-24 overflow-hidden"
            variants={scaleReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Terracotta radial bleed */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 15% 70%, rgba(184,85,58,0.28) 0%, transparent 55%), radial-gradient(circle at 85% 25%, rgba(124,59,38,0.18) 0%, transparent 45%)',
              }}
              aria-hidden
            />
            {/* Grain */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
              aria-hidden
            />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              {/* No badge/pill — just editorial rule label */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="w-8 h-px bg-[var(--color-accent)]" aria-hidden />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                  Start today
                </span>
                <span className="w-8 h-px bg-[var(--color-accent)]" aria-hidden />
              </div>

              <div className="overflow-hidden mb-6">
                <AnimatedHeadline
                  className="text-[clamp(2.5rem,6vw,4.5rem)] font-black tracking-tight text-white leading-[1.04]"
                  style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.03em' }}
                >
                  Your next skill is one course away.
                </AnimatedHeadline>
              </div>

              <p className="text-white/55 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Join 47,200+ learners building careers in design, tech, and beyond.
              </p>

              <Link
                to="/sign-up"
                className={cn(
                  'group inline-flex items-center gap-3',
                  'h-14 pl-8 pr-4 rounded-full',
                  'bg-[var(--color-accent)] text-white text-[13px] font-bold',
                  'hover:bg-[var(--color-accent-hover)] active:scale-[0.97]',
                  'shadow-[0_4px_24px_rgba(184,85,58,0.4)]',
                  'hover:shadow-[0_6px_30px_rgba(184,85,58,0.5)]',
                )}
                style={{ transition: `all 220ms cubic-bezier(${ease.outExpo.join(',')})` }}
              >
                Create free account
                <span className={cn(
                  'w-8 h-8 rounded-full bg-white/15 flex items-center justify-center',
                  'transition-transform duration-220',
                  'group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-110'
                )}>
                  <ArrowRight size={13} weight="bold" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
