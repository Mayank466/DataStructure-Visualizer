import { motion } from 'motion/react'
import type { VisualNode, NodeState } from '@/types'
import { NODE_COLORS, CANVAS } from '@/engine/constants'

interface NodeRendererProps {
  node: VisualNode
  shape?: 'circle' | 'rect'
}

function getColor(state: NodeState): string {
  return NODE_COLORS[state] || NODE_COLORS.default
}

/**
 * Generic node renderer — circle (for trees/graphs) or rect (for arrays/stacks/queues).
 * Animates position, color, and glow effects based on node state.
 */
export function NodeRenderer({ node, shape = 'circle' }: NodeRendererProps) {
  const color = getColor(node.state)
  const r = CANVAS.NODE_RADIUS
  const isActive = node.state !== 'default' && node.state !== 'visited'
  const isNull = node.meta?.isNull

  if (isNull) {
    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5, x: node.x, y: node.y }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-tertiary)"
          fontSize="12"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          NULL
        </text>
      </motion.g>
    )
  }

  if (shape === 'rect') {
    const w = CANVAS.ARRAY_CELL_WIDTH - 2
    const h = CANVAS.ARRAY_CELL_HEIGHT

    return (
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <motion.rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={10}
          fill={color}
          animate={{ fill: color }}
          transition={{ duration: 0.3 }}
          style={{
            filter: isActive ? `drop-shadow(0 0 12px ${color})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="15"
          fontFamily="var(--font-mono)"
          fontWeight="700"
        >
          {node.value}
        </text>
        {node.label && (
          <text
            y={h / 2 + 16}
            textAnchor="middle"
            fill="var(--text-tertiary)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            fontWeight="600"
          >
            {node.label}
          </text>
        )}
      </motion.g>
    )
  }

  // Circle shape (trees, graphs)
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Glow ring for active states */}
      {isActive && (
        <motion.circle
          r={r + 6}
          fill="none"
          stroke={color}
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            r: [r + 4, r + 8, r + 4],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main circle */}
      <motion.circle
        r={r}
        fill={color}
        animate={{ fill: color }}
        transition={{ duration: 0.3 }}
        style={{
          filter: isActive
            ? `drop-shadow(0 0 16px ${color})`
            : 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))',
        }}
      />

      {/* Value text */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="14"
        fontFamily="var(--font-mono)"
        fontWeight="700"
      >
        {node.value}
      </text>

      {/* Label above */}
      {node.label && (
        <text
          y={-r - 10}
          textAnchor="middle"
          fill="var(--text-tertiary)"
          fontSize="10"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          {node.label}
        </text>
      )}
    </motion.g>
  )
}
