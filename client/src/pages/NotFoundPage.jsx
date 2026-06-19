import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { spring, ease, dur } from '../lib/motion'

export default function NotFoundPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-[var(--color-canvas)]">
      <div className="text-center">
        {/* Giant editorial serif 404 */}
        <motion.p
          className="font-black text-[var(--color-border)] select-none leading-none mb-6"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(8rem, 20vw, 16rem)',
            letterSpacing: '-0.05em',
          }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring.bouncy, delay: 0.1 }}
        >
          404
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.slow, delay: 0.35, ease: ease.outExpo }}
        >
          <h1
            className="text-2xl font-black text-[var(--color-ink)] mb-2"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}
          >
            Page not found.
          </h1>
          <p className="text-[var(--color-ink-muted)] mb-8">
            This page doesn't exist or was moved.
          </p>
          <Link
            to="/"
            className="group inline-flex items-center gap-2.5 h-10 pl-5 pr-3 rounded-full bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] active:scale-[0.97]"
            style={{ transition: `all 200ms cubic-bezier(${ease.outExpo.join(',')})` }}
          >
            <ArrowLeft size={14} weight="bold" />
            Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
