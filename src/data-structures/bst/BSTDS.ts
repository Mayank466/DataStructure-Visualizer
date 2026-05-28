import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode, VisualEdge } from '@/types'

interface BSTNode {
  value: number
  left: BSTNode | null
  right: BSTNode | null
}

/**
 * Binary Search Tree — insert/delete/search/traversal with tree layout animations.
 */
export class BSTDS extends DataStructureBase<number> {
  private root: BSTNode | null = null

  getVisualizationState(): VisualizationState {
    return this.buildState()
  }

  private buildState(
    highlightValues: Map<number, string> = new Map(),
    description = ''
  ): VisualizationState {
    const nodes: VisualNode[] = []
    const edges: VisualEdge[] = []

    if (this.root) {
      this.layoutTree(this.root, 400, 50, 180, 0, nodes, edges, highlightValues)
    }

    return { nodes, edges, description }
  }

  private layoutTree(
    node: BSTNode,
    x: number,
    y: number,
    hSpacing: number,
    depth: number,
    nodes: VisualNode[],
    edges: VisualEdge[],
    highlights: Map<number, string>
  ): void {
    const nodeId = `bst-${node.value}-${depth}`
    const state = highlights.has(node.value)
      ? (highlights.get(node.value) as VisualNode['state'])
      : 'default'

    nodes.push({
      id: nodeId,
      value: node.value,
      x,
      y,
      state,
      label: depth === 0 ? 'ROOT' : '',
      meta: { depth },
    })

    if (node.left) {
      const childX = x - hSpacing
      const childY = y + 80
      const childId = `bst-${node.left.value}-${depth + 1}`

      edges.push({
        id: `edge-${nodeId}-${childId}`,
        sourceId: nodeId,
        targetId: childId,
        state: highlights.has(node.left.value) ? (highlights.get(node.left.value) as VisualEdge['state']) : 'default',
        directed: true,
      })

      this.layoutTree(node.left, childX, childY, hSpacing * 0.55, depth + 1, nodes, edges, highlights)
    }

    if (node.right) {
      const childX = x + hSpacing
      const childY = y + 80
      const childId = `bst-${node.right.value}-${depth + 1}`

      edges.push({
        id: `edge-${nodeId}-${childId}`,
        sourceId: nodeId,
        targetId: childId,
        state: highlights.has(node.right.value) ? (highlights.get(node.right.value) as VisualEdge['state']) : 'default',
        directed: true,
      })

      this.layoutTree(node.right, childX, childY, hSpacing * 0.55, depth + 1, nodes, edges, highlights)
    }
  }

  insert(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Inserting ${value} into BST`),
      `Inserting ${value}`, 'insert', 0
    ))

    if (!this.root) {
      this.root = { value, left: null, right: null }
      steps.push(this.createStep(
        this.buildState(new Map([[value, 'inserting']]), `${value} is the new root`),
        `${value} is the root`, 'insert', 1
      ))
      return steps
    }

    let current = this.root
    const path: number[] = []

    while (true) {
      path.push(current.value)
      const highlights = new Map<number, string>()
      path.forEach((v) => highlights.set(v, 'comparing'))

      if (value < current.value) {
        steps.push(this.createStep(
          this.buildState(highlights, `${value} < ${current.value} → go left`),
          `${value} < ${current.value} → left`, 'insert', 2
        ))

        if (!current.left) {
          current.left = { value, left: null, right: null }
          highlights.set(value, 'inserting')
          steps.push(this.createStep(
            this.buildState(highlights, `Inserted ${value} as left child`),
            `Inserted ${value}`, 'insert', 3
          ))
          break
        }
        current = current.left
      } else if (value > current.value) {
        steps.push(this.createStep(
          this.buildState(highlights, `${value} > ${current.value} → go right`),
          `${value} > ${current.value} → right`, 'insert', 2
        ))

        if (!current.right) {
          current.right = { value, left: null, right: null }
          highlights.set(value, 'inserting')
          steps.push(this.createStep(
            this.buildState(highlights, `Inserted ${value} as right child`),
            `Inserted ${value}`, 'insert', 3
          ))
          break
        }
        current = current.right
      } else {
        steps.push(this.createStep(
          this.buildState(highlights, `${value} already exists in BST`),
          `Duplicate: ${value}`, 'insert', 4
        ))
        break
      }
    }

    return steps
  }

  delete(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Deleting ${value} from BST`),
      `Deleting ${value}`, 'delete', 0
    ))

    // Search for the node first
    const searchSteps = this.searchPath(value)
    for (const step of searchSteps) {
      steps.push(step)
    }

    // Perform actual deletion
    this.root = this.deleteNode(this.root, value)

    steps.push(this.createStep(
      this.buildState(new Map(), `BST after deletion of ${value}`),
      `Deleted ${value}`, 'delete', 5
    ))

    return steps
  }

  private deleteNode(node: BSTNode | null, value: number): BSTNode | null {
    if (!node) return null

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value)
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value)
    } else {
      // Node found
      if (!node.left) return node.right
      if (!node.right) return node.left

      // Two children — find inorder successor
      let successor = node.right
      while (successor.left) successor = successor.left
      node.value = successor.value
      node.right = this.deleteNode(node.right, successor.value)
    }
    return node
  }

  private searchPath(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    let current = this.root
    const path: number[] = []

    while (current) {
      path.push(current.value)
      const highlights = new Map<number, string>()
      path.forEach((v, i) => highlights.set(v, i === path.length - 1 ? 'comparing' : 'visited'))

      if (value === current.value) {
        highlights.set(value, 'found')
        steps.push(this.createStep(
          this.buildState(highlights, `Found ${value}!`),
          `Found ${value}!`, 'search', 2
        ))
        return steps
      }

      steps.push(this.createStep(
        this.buildState(highlights, value < current.value ? `${value} < ${current.value} → left` : `${value} > ${current.value} → right`),
        value < current.value ? `Go left` : `Go right`, 'search', 1
      ))

      current = value < current.value ? current.left : current.right
    }

    steps.push(this.createStep(
      this.buildState(new Map(), `${value} not found`),
      `${value} not found`, 'search', 3
    ))

    return steps
  }

  search(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    steps.push(this.createStep(
      this.buildState(new Map(), `Searching for ${value}`),
      `Searching for ${value}`, 'search', 0
    ))
    return [...steps, ...this.searchPath(value)]
  }

  /** Inorder traversal with step-by-step animation */
  traverse(order: 'inorder' | 'preorder' | 'postorder' = 'inorder'): AnimationStep[] {
    const steps: AnimationStep[] = []
    const visited: number[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `${order} traversal`),
      `Starting ${order} traversal`, 'traverse', 0
    ))

    const visit = (node: BSTNode | null) => {
      if (!node) return

      if (order === 'preorder') {
        visited.push(node.value)
        const h = new Map<number, string>()
        visited.forEach((v) => h.set(v, 'visited'))
        h.set(node.value, 'active')
        steps.push(this.createStep(
          this.buildState(h, `Visit ${node.value} → [${visited.join(', ')}]`),
          `Visit ${node.value}`, 'traverse', 1
        ))
      }

      visit(node.left)

      if (order === 'inorder') {
        visited.push(node.value)
        const h = new Map<number, string>()
        visited.forEach((v) => h.set(v, 'visited'))
        h.set(node.value, 'active')
        steps.push(this.createStep(
          this.buildState(h, `Visit ${node.value} → [${visited.join(', ')}]`),
          `Visit ${node.value}`, 'traverse', 1
        ))
      }

      visit(node.right)

      if (order === 'postorder') {
        visited.push(node.value)
        const h = new Map<number, string>()
        visited.forEach((v) => h.set(v, 'visited'))
        h.set(node.value, 'active')
        steps.push(this.createStep(
          this.buildState(h, `Visit ${node.value} → [${visited.join(', ')}]`),
          `Visit ${node.value}`, 'traverse', 1
        ))
      }
    }

    visit(this.root)

    steps.push(this.createStep(
      this.buildState(new Map(visited.map((v) => [v, 'found'] as [number, string])),
        `Traversal complete: [${visited.join(', ')}]`),
      `Complete: [${visited.join(', ')}]`, 'traverse', 2
    ))

    return steps
  }

  reset(): void { this.root = null; this.stepCounter = 0 }

  generateRandom(count = 7): AnimationStep[] {
    this.root = null
    const values = new Set<number>()
    while (values.size < count) values.add(Math.floor(Math.random() * 99) + 1)

    for (const v of values) {
      this.insertSilent(v)
    }

    return [this.createStep(
      this.buildState(new Map(), `Generated BST with ${count} nodes`),
      `Generated BST`, 'generate'
    )]
  }

  private insertSilent(value: number): void {
    const node: BSTNode = { value, left: null, right: null }
    if (!this.root) { this.root = node; return }
    let current = this.root
    while (true) {
      if (value < current.value) {
        if (!current.left) { current.left = node; return }
        current = current.left
      } else if (value > current.value) {
        if (!current.right) { current.right = node; return }
        current = current.right
      } else return
    }
  }

  toArray(): number[] {
    const arr: number[] = []
    const inorder = (node: BSTNode | null) => {
      if (!node) return
      inorder(node.left)
      arr.push(node.value)
      inorder(node.right)
    }
    inorder(this.root)
    return arr
  }
}
