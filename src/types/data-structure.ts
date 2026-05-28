/* ========================================
   GLOBAL TYPES — Data Structure
   ======================================== */

/** All supported data structure types */
export type DataStructureType =
  | 'array'
  | 'linked-list'
  | 'stack'
  | 'queue'
  | 'deque'
  | 'hash-table'
  | 'binary-tree'
  | 'bst'
  | 'avl'
  | 'heap'
  | 'graph'
  | 'trie'

/** Categorization for the sidebar */
export type DataStructureCategory = 'linear' | 'tree' | 'graph' | 'hash'

export interface DataStructureInfo {
  type: DataStructureType
  label: string
  category: DataStructureCategory
  description: string
  icon: string
}

/** Registry of all supported data structures */
export const DATA_STRUCTURES: DataStructureInfo[] = [
  // Linear
  { type: 'array', label: 'Array', category: 'linear', description: 'Contiguous memory, indexed access', icon: '📊' },
  { type: 'linked-list', label: 'Linked List', category: 'linear', description: 'Nodes linked by pointers', icon: '🔗' },
  { type: 'stack', label: 'Stack', category: 'linear', description: 'LIFO — Last In, First Out', icon: '📚' },
  { type: 'queue', label: 'Queue', category: 'linear', description: 'FIFO — First In, First Out', icon: '🚶' },
  { type: 'deque', label: 'Deque', category: 'linear', description: 'Double-ended queue', icon: '↔️' },

  // Hash
  { type: 'hash-table', label: 'Hash Table', category: 'hash', description: 'Key-value with hashing', icon: '#️⃣' },

  // Tree
  { type: 'binary-tree', label: 'Binary Tree', category: 'tree', description: 'Generic binary tree', icon: '🌲' },
  { type: 'bst', label: 'BST', category: 'tree', description: 'Binary Search Tree', icon: '🔍' },
  { type: 'avl', label: 'AVL Tree', category: 'tree', description: 'Self-balancing BST', icon: '⚖️' },
  { type: 'heap', label: 'Heap', category: 'tree', description: 'Min/Max priority queue', icon: '⛰️' },
  { type: 'trie', label: 'Trie', category: 'tree', description: 'Prefix tree for strings', icon: '🔤' },

  // Graph
  { type: 'graph', label: 'Graph', category: 'graph', description: 'Vertices and edges', icon: '🕸️' },
]

/** Map of category to display info */
export const CATEGORY_LABELS: Record<DataStructureCategory, { label: string; icon: string }> = {
  linear: { label: 'Linear', icon: '📏' },
  hash: { label: 'Hash-Based', icon: '#️⃣' },
  tree: { label: 'Trees', icon: '🌳' },
  graph: { label: 'Graphs', icon: '🕸️' },
}
