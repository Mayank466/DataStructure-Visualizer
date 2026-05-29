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
    <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Center + Right wrapper */}
      <div className="flex flex-col md:flex-row flex-1 min-w-0 h-full">
        
        {/* Canvas + BottomPanel wrapper (unwraps on mobile to allow reordering) */}
        <div className="contents md:flex md:flex-col md:flex-1 md:min-w-0 md:h-full">
          
          {/* Mobile top bar */}
          <div
            className="order-1 md:hidden flex items-center justify-between px-4 py-2 border-b shrink-0"
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
              DSVisualizer
            </span>
            <div className="w-9 h-9" />
          </div>

          {/* Visualization Canvas */}
          <div className="order-2 flex-1 min-h-0 relative">
            <VisualizationCanvas />
          </div>

          {/* Bottom Panel */}
          <div className="order-4 shrink-0">
            <BottomPanel />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="order-3 shrink-0 flex flex-col">
          <RightSidebar
            onInsert={handleInsert}
            onDelete={handleDelete}
            onSearch={handleSearch}
            onRandom={handleRandom}
            onReset={handleReset}
            onTraverse={handleTraverse}
          />
        </div>
      </div>
    </div>
  )
}
