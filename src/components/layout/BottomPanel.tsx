import { motion, AnimatePresence } from 'motion/react'
import { useVisualizerStore, useHistoryStore, useAnimationStore } from '@/stores'
import { ChevronUp, ChevronDown, Clock, Trash2, Code2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useState } from 'react'
import { PseudocodePanel } from '@/components/education/PseudocodePanel'
import type { OperationType } from '@/types'

type PanelTab = 'history' | 'pseudocode'

/**
 * Bottom panel — expandable panel with tabs for Operation History and Pseudocode.
 */
export function BottomPanel() {
  const { bottomPanelExpanded, toggleBottomPanel, selectedDS } = useVisualizerStore()
  const { entries, clearHistory } = useHistoryStore()
  const { steps, currentStepIndex } = useAnimationStore()
  
  const [activeTab, setActiveTab] = useState<PanelTab>('history')

  // Get current operation type and active line from animation state
  const currentStep = steps[currentStepIndex]
  const currentOp = (currentStep?.operationType || (entries[0]?.operation) || 'insert') as OperationType
  const activeLine = currentStep?.codeLine

  return (
    <div
      className={cn(
        'glass-panel-solid border-t transition-all duration-300 shrink-0 flex flex-col',
      )}
      style={{
        borderColor: 'var(--border-default)',
        height: bottomPanelExpanded ? '240px' : '36px',
      }}
    >
      {/* Header / Toggle bar */}
      <div className="flex items-center justify-between px-4 h-9 shrink-0 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 h-full">
          <button
            onClick={() => { setActiveTab('history'); if (!bottomPanelExpanded) toggleBottomPanel() }}
            className={cn(
              "flex items-center gap-2 h-full px-3 text-xs font-semibold uppercase tracking-wider relative",
              activeTab === 'history' ? "text-primary" : "text-tertiary hover:text-secondary"
            )}
            style={{ color: activeTab === 'history' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
          >
            <Clock size={12} />
            History
            {entries.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: 'var(--color-primary-500)', color: 'white' }}>
                {entries.length}
              </span>
            )}
            {activeTab === 'history' && (
              <motion.div layoutId="activeTabBottom" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--color-primary-500)' }} />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('pseudocode'); if (!bottomPanelExpanded) toggleBottomPanel() }}
            className={cn(
              "flex items-center gap-2 h-full px-3 text-xs font-semibold uppercase tracking-wider relative",
              activeTab === 'pseudocode' ? "text-primary" : "text-tertiary hover:text-secondary"
            )}
            style={{ color: activeTab === 'pseudocode' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
          >
            <Code2 size={12} />
            Algorithm
            {activeTab === 'pseudocode' && (
              <motion.div layoutId="activeTabBottom" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--color-primary-500)' }} />
            )}
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {bottomPanelExpanded && activeTab === 'history' && entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => { e.stopPropagation(); clearHistory() }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer transition-colors"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}
            >
              <Trash2 size={10} />
              Clear
            </motion.div>
          )}
          <button onClick={toggleBottomPanel} className="p-1 rounded cursor-pointer hover:bg-white/5 text-secondary">
            {bottomPanelExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <AnimatePresence mode="wait">
        {bottomPanelExpanded && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden"
          >
            {activeTab === 'history' ? (
              <div className="h-full overflow-y-auto px-4 py-3">
                {entries.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    No operations yet. Try inserting some data!
                  </div>
                ) : (
                  <div className="space-y-1">
                    {entries.map((entry, i) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs"
                        style={{
                          background: i === 0 ? 'var(--bg-active)' : 'transparent',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span className="shrink-0 w-16 text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                          {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase"
                          style={{ background: 'var(--bg-hover)', color: 'var(--color-primary-500)' }}>
                          {entry.operation}
                        </span>
                        <span className="truncate">{entry.description}</span>
                        {entry.value !== undefined && (
                          <span className="shrink-0 font-mono font-semibold" style={{ color: 'var(--color-accent-500)' }}>
                            {entry.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <PseudocodePanel dsType={selectedDS} operation={currentOp} activeLine={activeLine} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
