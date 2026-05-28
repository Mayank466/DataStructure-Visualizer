/* ========================================
   GLOBAL TYPES — Animation
   ======================================== */

/** The visual state of a single node in the visualization */
export type NodeState =
  | 'default'
  | 'highlight'
  | 'active'
  | 'visited'
  | 'found'
  | 'error'
  | 'inserting'
  | 'deleting'
  | 'comparing'

/** Represents a visual node in the visualization */
export interface VisualNode {
  id: string
  value: string | number
  x: number
  y: number
  state: NodeState
  label?: string
  /** Extra data (e.g., index for array, depth for tree) */
  meta?: Record<string, unknown>
}

/** Represents a visual edge/connection between nodes */
export interface VisualEdge {
  id: string
  sourceId: string
  targetId: string
  state: NodeState
  label?: string
  directed?: boolean
  curved?: boolean
  weight?: number
}

/** The complete visual state for a single animation frame */
export interface VisualizationState {
  nodes: VisualNode[]
  edges: VisualEdge[]
  /** Pseudocode line number to highlight (0-indexed) */
  highlightedLine?: number
  /** Description of what's happening at this step */
  description?: string
}

/** A single step in an animation sequence */
export interface AnimationStep {
  /** Unique ID for this step */
  id: string
  /** The full visualization state at this step */
  state: VisualizationState
  /** Duration override in ms (default: uses global speed) */
  duration?: number
  /** Pseudocode line to highlight */
  codeLine?: number
  /** Human-readable description of this step */
  description: string
  /** Operation type for logging */
  operationType: OperationType
}

/** Supported operations across all data structures */
export type OperationType =
  | 'insert'
  | 'delete'
  | 'search'
  | 'update'
  | 'traverse'
  | 'reset'
  | 'generate'
  | 'rotate'
  | 'swap'
  | 'compare'
  | 'enqueue'
  | 'dequeue'
  | 'push'
  | 'pop'
  | 'peek'
  | 'heapify'
  | 'hash'
  | 'bfs'
  | 'dfs'
  | 'dijkstra'

/** Animation playback status */
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'stepping' | 'completed'

/** An entry in the operation history log */
export interface OperationLogEntry {
  id: string
  timestamp: number
  operationType: OperationType
  description: string
  inputValue?: string | number
  stepCount: number
}

/** Pseudocode definition for a data structure operation */
export interface PseudocodeDefinition {
  operationType: OperationType
  lines: string[]
  timeComplexity: ComplexityInfo
  spaceComplexity: ComplexityInfo
}

export interface ComplexityInfo {
  best: string
  average: string
  worst: string
}
