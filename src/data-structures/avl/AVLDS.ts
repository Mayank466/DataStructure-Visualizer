import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode, VisualEdge } from '@/types'

interface AVLNode {
  value: number
  left: AVLNode | null
  right: AVLNode | null
  height: number
}

/**
 * AVL Tree — Self-balancing BST with rotation animations.
 */
export class AVLDS extends DataStructureBase<number> {
  private root: AVLNode | null = null

  private getHeight(node: AVLNode | null): number { return node ? node.height : 0 }
  private getBalance(node: AVLNode | null): number { return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0 }
  private updateHeight(node: AVLNode): void { node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1 }

  private rotateRight(y: AVLNode): AVLNode {
    const x = y.left!
    y.left = x.right
    x.right = y
    this.updateHeight(y)
    this.updateHeight(x)
    return x
  }

  private rotateLeft(x: AVLNode): AVLNode {
    const y = x.right!
    x.right = y.left
    y.left = x
    this.updateHeight(x)
    this.updateHeight(y)
    return y
  }

  getVisualizationState(): VisualizationState { return this.buildState() }

  private buildState(highlights: Map<number, string> = new Map(), description = ''): VisualizationState {
    const nodes: VisualNode[] = []
    const edges: VisualEdge[] = []
    if (this.root) this.layoutTree(this.root, 400, 50, 180, 0, nodes, edges, highlights)
    return { nodes, edges, description }
  }

  private layoutTree(node: AVLNode, x: number, y: number, hSpacing: number, depth: number, nodes: VisualNode[], edges: VisualEdge[], highlights: Map<number, string>): void {
    const nodeId = `avl-${node.value}`
    const state = highlights.has(node.value) ? (highlights.get(node.value) as VisualNode['state']) : 'default'
    const bf = this.getBalance(node)

    nodes.push({
      id: nodeId, value: node.value, x, y, state,
      label: `bf=${bf}`,
      meta: { depth, height: node.height, balanceFactor: bf },
    })

    if (node.left) {
      const childId = `avl-${node.left.value}`
      edges.push({ id: `edge-${nodeId}-${childId}`, sourceId: nodeId, targetId: childId, state: 'default', directed: true })
      this.layoutTree(node.left, x - hSpacing, y + 80, hSpacing * 0.55, depth + 1, nodes, edges, highlights)
    }
    if (node.right) {
      const childId = `avl-${node.right.value}`
      edges.push({ id: `edge-${nodeId}-${childId}`, sourceId: nodeId, targetId: childId, state: 'default', directed: true })
      this.layoutTree(node.right, x + hSpacing, y + 80, hSpacing * 0.55, depth + 1, nodes, edges, highlights)
    }
  }

  insert(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    steps.push(this.createStep(this.buildState(new Map(), `Inserting ${value} into AVL tree`), `Insert ${value}`, 'insert', 0))

    this.root = this.insertNode(this.root, value, steps)

    steps.push(this.createStep(this.buildState(new Map([[value, 'found']]), `AVL tree balanced after insertion`), `Balanced`, 'insert', 5))
    return steps
  }

  private insertNode(node: AVLNode | null, value: number, steps: AnimationStep[]): AVLNode {
    if (!node) {
      const newNode: AVLNode = { value, left: null, right: null, height: 1 }
      steps.push(this.createStep(this.buildState(new Map([[value, 'inserting']]), `Created node ${value}`), `Created ${value}`, 'insert', 1))
      return newNode
    }

    steps.push(this.createStep(this.buildState(new Map([[node.value, 'comparing']]), `${value} vs ${node.value}`), `Compare`, 'insert', 2))

    if (value < node.value) {
      node.left = this.insertNode(node.left, value, steps)
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value, steps)
    } else {
      return node // Duplicate
    }

    this.updateHeight(node)
    const balance = this.getBalance(node)

    // Check for imbalance and perform rotations
    if (balance > 1 && value < node.left!.value) {
      // LL case
      steps.push(this.createStep(this.buildState(new Map([[node.value, 'error']]), `Left-Left imbalance at ${node.value} — Right Rotation`), `LL Rotation`, 'rotate', 3))
      return this.rotateRight(node)
    }
    if (balance < -1 && value > node.right!.value) {
      // RR case
      steps.push(this.createStep(this.buildState(new Map([[node.value, 'error']]), `Right-Right imbalance at ${node.value} — Left Rotation`), `RR Rotation`, 'rotate', 3))
      return this.rotateLeft(node)
    }
    if (balance > 1 && value > node.left!.value) {
      // LR case
      steps.push(this.createStep(this.buildState(new Map([[node.value, 'error']]), `Left-Right imbalance — LR Rotation`), `LR Rotation`, 'rotate', 3))
      node.left = this.rotateLeft(node.left!)
      return this.rotateRight(node)
    }
    if (balance < -1 && value < node.right!.value) {
      // RL case
      steps.push(this.createStep(this.buildState(new Map([[node.value, 'error']]), `Right-Left imbalance — RL Rotation`), `RL Rotation`, 'rotate', 3))
      node.right = this.rotateRight(node.right!)
      return this.rotateLeft(node)
    }

    return node
  }

  delete(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    steps.push(this.createStep(this.buildState(new Map(), `Deleting ${value} from AVL tree`), `Delete ${value}`, 'delete', 0))
    this.root = this.deleteNode(this.root, value, steps)
    steps.push(this.createStep(this.buildState(new Map(), `AVL tree balanced after deletion`), `Balanced`, 'delete', 5))
    return steps
  }

  private deleteNode(node: AVLNode | null, value: number, steps: AnimationStep[]): AVLNode | null {
    if (!node) return null

    if (value < node.value) { node.left = this.deleteNode(node.left, value, steps) }
    else if (value > node.value) { node.right = this.deleteNode(node.right, value, steps) }
    else {
      steps.push(this.createStep(this.buildState(new Map([[value, 'deleting']]), `Found ${value}`), `Found`, 'delete', 1))

      if (!node.left || !node.right) {
        return node.left || node.right
      }

      let successor = node.right
      while (successor.left) successor = successor.left
      node.value = successor.value
      node.right = this.deleteNode(node.right, successor.value, steps)
    }

    this.updateHeight(node)
    const balance = this.getBalance(node)

    if (balance > 1 && this.getBalance(node.left) >= 0) { return this.rotateRight(node) }
    if (balance > 1 && this.getBalance(node.left) < 0) { node.left = this.rotateLeft(node.left!); return this.rotateRight(node) }
    if (balance < -1 && this.getBalance(node.right) <= 0) { return this.rotateLeft(node) }
    if (balance < -1 && this.getBalance(node.right) > 0) { node.right = this.rotateRight(node.right!); return this.rotateLeft(node) }

    return node
  }

  search(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    let current = this.root
    const path: number[] = []

    steps.push(this.createStep(this.buildState(new Map(), `Searching for ${value}`), `Search ${value}`, 'search', 0))

    while (current) {
      path.push(current.value)
      const h = new Map<number, string>()
      path.forEach((v, i) => h.set(v, i === path.length - 1 ? 'comparing' : 'visited'))

      if (value === current.value) {
        h.set(value, 'found')
        steps.push(this.createStep(this.buildState(h, `Found ${value}!`), `Found!`, 'search', 1))
        return steps
      }

      steps.push(this.createStep(this.buildState(h, value < current.value ? `Go left` : `Go right`), `Compare`, 'search', 1))
      current = value < current.value ? current.left : current.right
    }

    steps.push(this.createStep(this.buildState(new Map(), `${value} not found`), `Not found`, 'search', 2))
    return steps
  }

  reset(): void { this.root = null; this.stepCounter = 0 }

  generateRandom(count = 7): AnimationStep[] {
    this.root = null
    const values = new Set<number>()
    while (values.size < count) values.add(Math.floor(Math.random() * 99) + 1)
    for (const v of values) this.root = this.insertNodeSilent(this.root, v)
    return [this.createStep(this.buildState(new Map(), `Generated AVL tree with ${count} nodes`), `Generated AVL`, 'generate')]
  }

  private insertNodeSilent(node: AVLNode | null, value: number): AVLNode {
    if (!node) return { value, left: null, right: null, height: 1 }
    if (value < node.value) node.left = this.insertNodeSilent(node.left, value)
    else if (value > node.value) node.right = this.insertNodeSilent(node.right, value)
    else return node

    this.updateHeight(node)
    const balance = this.getBalance(node)
    if (balance > 1 && value < node.left!.value) return this.rotateRight(node)
    if (balance < -1 && value > node.right!.value) return this.rotateLeft(node)
    if (balance > 1 && value > node.left!.value) { node.left = this.rotateLeft(node.left!); return this.rotateRight(node) }
    if (balance < -1 && value < node.right!.value) { node.right = this.rotateRight(node.right!); return this.rotateLeft(node) }
    return node
  }

  toArray(): number[] {
    const arr: number[] = []
    const inorder = (n: AVLNode | null) => { if (!n) return; inorder(n.left); arr.push(n.value); inorder(n.right) }
    inorder(this.root)
    return arr
  }
}
