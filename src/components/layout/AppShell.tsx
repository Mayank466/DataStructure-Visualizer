import { LeftSidebar } from './LeftSidebar'
import { VisualizationCanvas } from './VisualizationCanvas'
import { RightSidebar } from './RightSidebar'
import { BottomPanel } from './BottomPanel'
import { useVisualizerStore } from '@/stores'
import { useDataStructureController } from '@/hooks/useDataStructureController'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Menu, PanelRight } from 'lucide-react'
import { motion } from 'motion/react'

/**
 * Main app shell — 4-panel responsive layout.
 * Wires up the DS controller to all child panels.
 */
export function AppShell() {
  useKeyboardShortcuts()
  const { toggleLeftSidebar, toggleRightSidebar } = useVisualizerStore()
  const {
    handleInsert,
    handleDelete,
    handleSearch,
    handleRandom,
    handleReset,
    handleTraverse,
  } = useDataStructureController()

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Center + Bottom */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-2 border-b shrink-0"
          style={{
            background: 'var(--bg-panel-solid)',
            borderColor: 'var(--border-default)',
          }}
        >
          <motion.button
            onClick={toggleLeftSidebar}
            className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open structure selection"
          >
            <Menu size={16} />
          </motion.button>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            DSVisualizer_test
          </span>
          <motion.button
            onClick={toggleRightSidebar}
            className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open controls"
          >
            <PanelRight size={16} />
          </motion.button>
        </div>

        {/* Visualization Canvas */}
        <VisualizationCanvas />

        {/* Bottom Panel */}
        <BottomPanel />
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        onInsert={handleInsert}
        onDelete={handleDelete}
        onSearch={handleSearch}
        onRandom={handleRandom}
        onReset={handleReset}
        onTraverse={handleTraverse}
      />
    </div>
  )
}
