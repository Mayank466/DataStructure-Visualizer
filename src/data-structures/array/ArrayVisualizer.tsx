import { motion, AnimatePresence } from 'motion/react'
import type { VisualNode, NodeState } from '@/types'
import { NODE_COLORS, CANVAS } from '@/engine/constants'

interface ArrayVisualizerProps {
  nodes: VisualNode[]
  canvasWidth: number
  canvasHeight: number
}

/** Map node state to fill color */
function getNodeColor(state: NodeState): string {
  return NODE_COLORS[state] || NODE_COLORS.default
}

/**
 * Array Visualizer — renders array as horizontal cells with animated transitions.
 * Each cell shows value, index label, and state-based coloring.
 */
export function ArrayVisualizer({ nodes, canvasWidth, canvasHeight }: ArrayVisualizerProps) {
  const cellW = CANVAS.ARRAY_CELL_WIDTH
  const cellH = CANVAS.ARRAY_CELL_HEIGHT

  // Center the array horizontally and vertically
  const totalWidth = nodes.length * cellW
  const offsetX = Math.max(CANVAS.PADDING, (canvasWidth - totalWidth) / 2)
  const offsetY = canvasHeight / 2 - cellH / 2

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      className="w-full h-full"
      style={{ overflow: 'visible' }}
    >
      {/* Array bracket decoration */}
      {nodes.length > 0 && (
        <>
          <motion.text
            x={offsetX - 16}
            y={offsetY + cellH / 2 + 6}
            fill="var(--text-tertiary)"
            fontSize="28"
            fontFamily="var(--font-mono)"
            fontWeight="300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          >
            [
          </motion.text>
          <motion.text
            x={offsetX + totalWidth + 4}
            y={offsetY + cellH / 2 + 6}
            fill="var(--text-tertiary)"
            fontSize="28"
            fontFamily="var(--font-mono)"
            fontWeight="300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
          >
            ]
          </motion.text>
        </>
      )}

      <AnimatePresence mode="popLayout">
        {nodes.map((node, i) => {
          const x = offsetX + i * cellW
          const y = offsetY
          const color = getNodeColor(node.state)
          const isActive = node.state !== 'default' && node.state !== 'visited'

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, y: y - 30, scale: 0.6 }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.5, y: y + 20 }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 25,
                delay: i * 0.03,
              }}
            >
              {/* Cell background */}
              <motion.rect
                x={x}
                y={y}
                width={cellW - 2}
                height={cellH}
                rx={10}
                ry={10}
                fill={color}
                animate={{
                  fill: color,
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  filter: isActive
                    ? `drop-shadow(0 0 12px ${color})`
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                }}
              />

              {/* Value text */}
              <motion.text
                x={x + (cellW - 2) / 2}
                y={y + cellH / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="15"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                animate={{ opacity: 1 }}
              >
                {node.value}
              </motion.text>

              {/* Index label below */}
              <motion.text
                x={x + (cellW - 2) / 2}
                y={y + cellH + 18}
                textAnchor="middle"
                fill="var(--text-tertiary)"
                fontSize="11"
                fontFamily="var(--font-mono)"
                fontWeight="500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
              >
                {node.label}
              </motion.text>

              {/* Active glow ring */}
              {isActive && (
                <motion.rect
                  x={x - 2}
                  y={y - 2}
                  width={cellW + 2}
                  height={cellH + 4}
                  rx={12}
                  ry={12}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.g>
          )
        })}
      </AnimatePresence>
    </svg>
  )
}
