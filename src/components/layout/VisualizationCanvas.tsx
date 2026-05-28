import { motion } from 'motion/react'
import { useVisualizerStore, useAnimationStore } from '@/stores'
import { DATA_STRUCTURES } from '@/types'
import { NodeRenderer } from '@/components/visualization/NodeRenderer'
import { EdgeRenderer } from '@/components/visualization/EdgeRenderer'
import type { DataStructureType } from '@/types'
import { useMemo, useRef, useEffect, useState } from 'react'

/** Determine node shape based on DS type */
function getNodeShape(dsType: DataStructureType): 'circle' | 'rect' {
  switch (dsType) {
    case 'array':
    case 'stack':
    case 'queue':
    case 'deque':
    case 'hash-table':
      return 'rect'
    default:
      return 'circle'
  }
}

/**
 * Center visualization canvas with dot grid background.
 * Renders the current visualization state using NodeRenderer and EdgeRenderer.
 */
export function VisualizationCanvas() {
  const { selectedDS, visualState } = useVisualizerStore()
  const { status, currentStepIndex, steps } = useAnimationStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  const dsInfo = useMemo(
    () => DATA_STRUCTURES.find((ds) => ds.type === selectedDS),
    [selectedDS]
  )

  // Track container dimensions
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length
    ? steps[currentStepIndex]
    : null
  const activeState = currentStep?.state ?? visualState
  const nodeShape = getNodeShape(selectedDS)

  return (
    <div ref={containerRef} className="relative flex-1 h-full overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 viz-canvas" style={{ background: 'var(--bg-canvas)' }} />

      {/* Canvas content */}
      <div className="relative z-10 w-full h-full">
        {!activeState || activeState.nodes.length === 0 ? (
          /* Empty state */
          <div className="flex items-center justify-center w-full h-full p-8">
            <motion.div
              className="flex flex-col items-center gap-4 text-center max-w-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <motion.div
                className="text-6xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {dsInfo?.icon || '📊'}
              </motion.div>
              <div>
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {dsInfo?.label || 'Select a Structure'}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Use the controls on the right to insert data and perform operations.
                  Watch the visualization come alive with step-by-step animations.
                </p>
              </div>

              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: status === 'playing'
                      ? 'var(--color-success-500)'
                      : 'var(--text-tertiary)',
                  }}
                />
                <span>Ready — Click &quot;Random&quot; to generate data</span>
              </div>
            </motion.div>
          </div>
        ) : (
          /* SVG Visualization */
          <svg
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* Edges first (below nodes) */}
            {activeState.edges.map((edge) => (
              <EdgeRenderer key={edge.id} edge={edge} nodes={activeState.nodes} />
            ))}

            {/* Nodes */}
            {activeState.nodes.map((node) => (
              <NodeRenderer key={node.id} node={node} shape={nodeShape} />
            ))}
          </svg>
        )}
      </div>

      {/* Top-left DS badge */}
      <motion.div
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold glass-panel"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        key={selectedDS}
      >
        <span>{dsInfo?.icon}</span>
        <span>{dsInfo?.label}</span>
      </motion.div>

      {/* Step description bar */}
      {currentStep && (
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-5 py-2.5 rounded-2xl text-sm font-medium glass-panel"
          style={{ color: 'var(--text-primary)', maxWidth: '80%' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentStep.id}
        >
          {currentStep.description}
        </motion.div>
      )}

      {/* Step progress */}
      {steps.length > 0 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono glass-panel"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Step {Math.max(0, currentStepIndex + 1)}/{steps.length}
        </div>
      )}
    </div>
  )
}
