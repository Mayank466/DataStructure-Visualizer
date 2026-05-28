/**
 * Animation Engine — Constants and defaults.
 */

/** Default duration per animation step (ms) */
export const DEFAULT_STEP_DURATION = 600

/** Speed multiplier options */
export const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2, 4] as const

/** Canvas dimensions */
export const CANVAS = {
  PADDING: 60,
  NODE_RADIUS: 24,
  NODE_SPACING: 72,
  ARRAY_CELL_WIDTH: 56,
  ARRAY_CELL_HEIGHT: 56,
  TREE_LEVEL_HEIGHT: 80,
  TREE_NODE_SPACING: 48,
  EDGE_ARROW_SIZE: 8,
} as const

/** Color semantic tokens for node states */
export const NODE_COLORS = {
  default: 'var(--node-default)',
  highlight: 'var(--node-highlight)',
  active: 'var(--node-active)',
  visited: 'var(--node-visited)',
  found: 'var(--node-found)',
  error: 'var(--node-error)',
  inserting: 'var(--color-success-500)',
  deleting: 'var(--color-error-500)',
  comparing: 'var(--color-warning-500)',
} as const
