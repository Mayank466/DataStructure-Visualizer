import { useThemeStore } from '@/stores/useThemeStore'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'

/**
 * Theme toggle button with smooth icon rotation animation.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 cursor-pointer"
      style={{
        background: 'var(--bg-hover)',
        color: 'var(--text-secondary)',
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </motion.div>
    </motion.button>
  )
}
