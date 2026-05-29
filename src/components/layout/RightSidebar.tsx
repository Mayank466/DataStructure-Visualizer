import { motion, AnimatePresence } from 'motion/react'
import { useVisualizerStore, useAnimationStore } from '@/stores'
import { cn } from '@/utils/cn'
import { Settings, Play, Pause, SkipForward, SkipBack, RotateCcw, Plus, Trash2, Search, Shuffle, X, TreePine } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { scheduler } from '@/engine/AnimationScheduler'

interface RightSidebarProps {
  onInsert: (value: number) => void
  onDelete: (value: number) => void
  onSearch: (value: number) => void
  onRandom: () => void
  onReset: () => void
  onTraverse?: (order: string) => void
}

/**
 * Right sidebar — operation controls and configuration.
 */
export function RightSidebar({ onInsert, onDelete, onSearch, onRandom, onReset, onTraverse }: RightSidebarProps) {
  const { selectedDS, rightSidebarOpen, setRightSidebar } = useVisualizerStore()
  const { status, speed, setSpeed, setStatus, steps, currentStepIndex } = useAnimationStore()
  const [inputValue, setInputValue] = useState('')

  const speedOptions = [0.25, 0.5, 1, 1.5, 2, 4]
  const isTreeType = ['bst', 'avl', 'binary-tree', 'heap', 'trie'].includes(selectedDS)
  const isGraphType = selectedDS === 'graph'

  const parseValue = (): number | null => {
    const v = Number(inputValue.trim())
    return isNaN(v) ? null : v
  }

  const handleInsert = () => {
    const v = parseValue()
    if (v !== null) { onInsert(v); setInputValue('') }
  }

  const handleDelete = () => {
    const v = parseValue()
    if (v !== null) { onDelete(v); setInputValue('') }
  }

  const handleSearch = () => {
    const v = parseValue()
    if (v !== null) { onSearch(v); setInputValue('') }
  }

  const handlePlay = () => {
    if (status === 'playing') {
      scheduler.pause()
    } else {
      scheduler.play()
    }
  }

  const handleStepForward = () => scheduler.stepForward()
  const handleStepBackward = () => scheduler.stepBackward()
  const handleResetPlayback = () => scheduler.stop()

  const [panelHeightVh, setPanelHeightVh] = useState(45)
  const isDragging = useRef(false)
  const dragState = useRef({ startY: 0, startHeight: 45 })

  const handlePointerDown = (e: React.PointerEvent) => {
    if (window.innerWidth >= 768) return
    isDragging.current = true
    dragState.current = { startY: e.clientY, startHeight: panelHeightVh }
    document.body.style.cursor = 'ns-resize'
  }

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const deltaY = e.clientY - dragState.current.startY
      const deltaVh = (deltaY / window.innerHeight) * 100
      const newHeight = Math.max(15, Math.min(80, dragState.current.startHeight - deltaVh))
      setPanelHeightVh(newHeight)
    }
    const handlePointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
      }
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [])

  return (
    <>
      <aside
        className={cn(
          'sidebar-right flex flex-col w-full md:w-[280px] shrink-0 overflow-hidden',
          'md:!h-full z-30',
          'glass-panel-solid border-t md:border-l md:border-t-0'
        )}
        style={{ 
          borderColor: 'var(--border-default)',
          height: window.innerWidth < 768 ? `${panelHeightVh}vh` : undefined
        }}
      >
        {/* Resize Handle (Mobile Only) */}
        <div 
          className="md:hidden flex justify-center py-2 cursor-ns-resize touch-none shrink-0"
          onPointerDown={handlePointerDown}
          style={{ background: 'var(--bg-canvas)' }}
        >
          <div className="w-12 h-1.5 rounded-full" style={{ background: 'var(--border-active)' }} />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Settings size={14} style={{ color: 'var(--text-tertiary)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Controls</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Input */}
          <div className="px-4 py-4">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-tertiary)' }}>Value Input</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter number..."
                className="flex-1 px-3 py-2 rounded-xl text-sm border-none outline-none"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInsert()
                }}
              />
              <motion.button
                onClick={handleInsert}
                className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                  color: 'white',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Insert value"
              >
                <Plus size={16} />
              </motion.button>
            </div>
          </div>

          {/* Operations */}
          <div className="px-4 pb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-tertiary)' }}>Operations</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Plus size={14} />, label: 'Insert', action: handleInsert, color: 'var(--color-primary-500)' },
                { icon: <Trash2 size={14} />, label: 'Delete', action: handleDelete, color: 'var(--color-error-500)' },
                { icon: <Search size={14} />, label: 'Search', action: handleSearch, color: 'var(--color-accent-500)' },
                { icon: <Shuffle size={14} />, label: 'Random', action: onRandom, color: 'var(--color-warning-500)' },
              ].map((op) => (
                <motion.button
                  key={op.label}
                  onClick={op.action}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                  style={{
                    background: 'var(--bg-hover)',
                    color: 'var(--text-secondary)',
                    borderLeft: `3px solid ${op.color}`,
                  }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {op.icon}
                  <span>{op.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Additional operations for specific DS types */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <motion.button
                onClick={onReset}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer col-span-2"
                style={{
                  background: 'var(--bg-hover)',
                  color: 'var(--text-tertiary)',
                  borderLeft: '3px solid var(--text-tertiary)',
                }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </motion.button>
            </div>

            {/* Traversal buttons for trees */}
            {isTreeType && onTraverse && (
              <div className="mt-3">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}>Traversal</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['inorder', 'preorder', 'postorder'].map((order) => (
                    <motion.button
                      key={order}
                      onClick={() => onTraverse(order)}
                      className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium cursor-pointer capitalize"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <TreePine size={10} />
                      {order.slice(0, 3)}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Traversal buttons for graphs */}
            {isGraphType && onTraverse && (
              <div className="mt-3">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}>Algorithms</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['bfs', 'dfs'].map((algo) => (
                    <motion.button
                      key={algo}
                      onClick={() => onTraverse(algo)}
                      className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium cursor-pointer uppercase"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {algo}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mx-4 border-t" style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Playback Controls */}
          <div className="px-4 py-4">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-tertiary)' }}>Playback</label>
            <div className="flex items-center justify-center gap-1">
              {[
                { icon: <RotateCcw size={14} />, action: handleResetPlayback, label: 'Reset' },
                { icon: <SkipBack size={14} />, action: handleStepBackward, label: 'Step Back' },
                {
                  icon: status === 'playing' ? <Pause size={16} /> : <Play size={16} />,
                  action: handlePlay,
                  label: status === 'playing' ? 'Pause' : 'Play',
                  primary: true,
                },
                { icon: <SkipForward size={14} />, action: handleStepForward, label: 'Step Forward' },
              ].map((btn) => (
                <motion.button
                  key={btn.label}
                  onClick={btn.action}
                  className={cn(
                    'flex items-center justify-center rounded-xl cursor-pointer',
                    btn.primary ? 'w-11 h-11' : 'w-9 h-9'
                  )}
                  style={{
                    background: btn.primary
                      ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))'
                      : 'var(--bg-hover)',
                    color: btn.primary ? 'white' : 'var(--text-secondary)',
                    ...(btn.primary && { boxShadow: 'var(--shadow-glow)' }),
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label={btn.label}
                  title={btn.label}
                >
                  {btn.icon}
                </motion.button>
              ))}
            </div>

            {/* Progress bar */}
            {steps.length > 0 && (
              <div className="mt-3">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-accent-500))' }}
                    animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Speed Control */}
          <div className="px-4 pb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-tertiary)' }}>Speed: {speed}x</label>
            <div className="flex gap-1">
              {speedOptions.map((s) => (
                <motion.button
                  key={s}
                  onClick={() => {
                    setSpeed(s)
                    scheduler.setSpeed(s)
                  }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    background: speed === s ? 'var(--color-primary-500)' : 'var(--bg-hover)',
                    color: speed === s ? 'white' : 'var(--text-tertiary)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {s}x
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mx-4 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
        </div>

        <div className="hidden md:flex items-center justify-center px-3 py-2 border-t shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            Press <kbd className="px-1 py-0.5 rounded text-[9px] font-mono" style={{ background: 'var(--bg-hover)' }}>Ctrl+.</kbd> to toggle sidebars, <kbd className="px-1 py-0.5 rounded text-[9px] font-mono" style={{ background: 'var(--bg-hover)' }}>H</kbd> for history
          </span>
        </div>
      </aside>
    </>
  )
}
