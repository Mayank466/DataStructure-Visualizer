import { motion } from 'motion/react'
import { Hexagon } from 'lucide-react'

/**
 * App logo with subtle floating animation.
 */
export function Logo() {
  return (
    <motion.div
      className="flex items-center gap-2.5"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        className="flex items-center justify-center w-8 h-8 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
        }}
        whileHover={{ rotate: 30, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Hexagon size={16} color="white" strokeWidth={2.5} />
      </motion.div>
      <div>
        <h1
          className="text-sm font-bold tracking-tight leading-none"
          style={{ color: 'var(--text-primary)' }}
        >
          DSVisualizer
        </h1>
        <p
          className="text-[10px] font-medium tracking-wide uppercase leading-none mt-0.5"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Interactive
        </p>
      </div>
    </motion.div>
  )
}
