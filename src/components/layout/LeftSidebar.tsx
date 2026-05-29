import { motion, AnimatePresence } from 'motion/react'
import { useVisualizerStore } from '@/stores'
import { DATA_STRUCTURES, CATEGORY_LABELS, type DataStructureCategory, type DataStructureType } from '@/types'
import { cn } from '@/utils/cn'
import { Logo } from '@/components/common/Logo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Search, X } from 'lucide-react'
import { useState, useMemo } from 'react'

/**
 * Left sidebar — data structure selection panel.
 * Groups structures by category with search filtering.
 */
export function LeftSidebar() {
  const { selectedDS, setSelectedDS, leftSidebarOpen, setLeftSidebar } = useVisualizerStore()
  const [search, setSearch] = useState('')

  const filteredStructures = useMemo(() => {
    if (!search.trim()) return DATA_STRUCTURES
    const q = search.toLowerCase()
    return DATA_STRUCTURES.filter(
      (ds) =>
        ds.label.toLowerCase().includes(q) ||
        ds.description.toLowerCase().includes(q) ||
        ds.category.includes(q)
    )
  }, [search])

  const groupedStructures = useMemo(() => {
    const groups: Partial<Record<DataStructureCategory, typeof filteredStructures>> = {}
    for (const ds of filteredStructures) {
      if (!groups[ds.category]) groups[ds.category] = []
      groups[ds.category]!.push(ds)
    }
    return groups
  }, [filteredStructures])

  const categories: DataStructureCategory[] = ['linear', 'tree', 'hash', 'graph']

  const handleSelect = (type: DataStructureType) => {
    setSelectedDS(type)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setLeftSidebar(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setLeftSidebar(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'sidebar-left flex flex-col h-full w-[260px] shrink-0 overflow-hidden',
          'glass-panel-solid',
          'border-r',
          leftSidebarOpen && 'open'
        )}
        style={{ borderColor: 'var(--border-default)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-colors cursor-pointer"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              onClick={() => setLeftSidebar(false)}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 shrink-0">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-secondary)',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search structures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Structure list */}
        <div className="flex-1 overflow-y-auto px-3 py-1">
          {categories.map((category) => {
            const items = groupedStructures[category]
            if (!items || items.length === 0) return null
            const catInfo = CATEGORY_LABELS[category]

            return (
              <div key={category} className="mb-3">
                <div
                  className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <span>{catInfo.icon}</span>
                  <span>{catInfo.label}</span>
                </div>

                <div className="flex flex-col gap-0.5">
                  {items.map((ds, i) => {
                    const isSelected = selectedDS === ds.type
                    return (
                      <motion.button
                        key={ds.type}
                        onClick={() => handleSelect(ds.type)}
                        className={cn(
                          'flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl',
                          'transition-all duration-200 cursor-pointer',
                          'group relative overflow-hidden'
                        )}
                        style={{
                          background: isSelected ? 'var(--bg-active)' : 'transparent',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          ...(isSelected && {
                            boxShadow: 'var(--shadow-glow)',
                          }),
                        }}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.25 }}
                        whileHover={{
                          backgroundColor: isSelected ? undefined : 'var(--bg-hover)',
                          x: 2,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Active indicator bar */}
                        {isSelected && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                            style={{
                              background: 'linear-gradient(to bottom, var(--color-primary-400), var(--color-accent-500))',
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}

                        <span className="text-base leading-none">{ds.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium truncate"
                            style={{
                              color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            }}
                          >
                            {ds.label}
                          </div>
                          <div
                            className="text-[11px] truncate mt-0.5"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {ds.description}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="text-[11px] text-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            ⌨️ Press <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--bg-hover)' }}>?</kbd> for shortcuts
          </div>
        </div>
      </aside>
    </>
  )
}
