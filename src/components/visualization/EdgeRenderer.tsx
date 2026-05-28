import { motion } from 'motion/react'
import type { VisualEdge, VisualNode, NodeState } from '@/types'
import { NODE_COLORS, CANVAS } from '@/engine/constants'

interface EdgeRendererProps {
  edge: VisualEdge
  nodes: VisualNode[]
}

function getEdgeColor(state: NodeState): string {
  if (state === 'default') return 'var(--edge-default)'
  if (state === 'active' || state === 'comparing') return 'var(--edge-active)'
  return NODE_COLORS[state] || 'var(--edge-default)'
}

/**
 * Edge renderer — draws animated lines/arrows between nodes.
 * Supports directed edges with arrowheads and curved paths.
 */
export function EdgeRenderer({ edge, nodes }: EdgeRendererProps) {
  const source = nodes.find((n) => n.id === edge.sourceId)
  const target = nodes.find((n) => n.id === edge.targetId)
  if (!source || !target) return null

  const color = getEdgeColor(edge.state)
  const r = CANVAS.NODE_RADIUS
  const isActive = edge.state !== 'default'

  // Calculate line from edge of source circle to edge of target circle
  const dx = target.x - source.x
  const dy = target.y - source.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist === 0) return null

  const nx = dx / dist
  const ny = dy / dist

  const x1 = source.x + nx * r
  const y1 = source.y + ny * r
  const x2 = target.x - nx * r
  const y2 = target.y - ny * r

  // Arrow marker
  const markerId = `arrow-${edge.id}`

  if (edge.curved) {
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const offsetX = -(y2 - y1) * 0.15
    const offsetY = (x2 - x1) * 0.15
    const path = `M ${x1} ${y1} Q ${mx + offsetX} ${my + offsetY} ${x2} ${y2}`

    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={isActive ? 2.5 : 1.5}
          strokeDasharray={edge.curved ? '4 4' : undefined}
          markerEnd={edge.directed ? `url(#${markerId})` : undefined}
          animate={{ stroke: color }}
          transition={{ duration: 0.3 }}
        />
      </motion.g>
    )
  }

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={isActive ? 2.5 : 1.5}
        markerEnd={edge.directed ? `url(#${markerId})` : undefined}
        animate={{ stroke: color, x1, y1, x2, y2 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          filter: isActive ? `drop-shadow(0 0 6px ${color})` : 'none',
        }}
      />

      {/* Weight label */}
      {edge.weight !== undefined && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 8}
          textAnchor="middle"
          fill="var(--text-secondary)"
          fontSize="10"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          {edge.weight}
        </text>
      )}
    </motion.g>
  )
}
