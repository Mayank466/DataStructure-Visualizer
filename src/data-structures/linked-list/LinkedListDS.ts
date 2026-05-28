import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode, VisualEdge } from '@/types'
import { CANVAS } from '@/engine/constants'

interface LLNode {
  value: number
  next: LLNode | null
  prev: LLNode | null // for doubly linked mode
}

/**
 * Linked List Data Structure — singly/doubly linked with pointer animations.
 */
export class LinkedListDS extends DataStructureBase<number> {
  private head: LLNode | null = null
  private _size = 0
  public doublyLinked = false

  getVisualizationState(): VisualizationState {
    return this.buildState()
  }

  private buildState(
    highlightIndices: Map<number, string> = new Map(),
    description = ''
  ): VisualizationState {
    const nodes: VisualNode[] = []
    const edges: VisualEdge[] = []
    let current = this.head
    let index = 0

    while (current) {
      const state = highlightIndices.has(index)
        ? (highlightIndices.get(index) as VisualNode['state'])
        : 'default'

      const nodeId = `ll-${index}`
      nodes.push({
        id: nodeId,
        value: current.value,
        x: CANVAS.PADDING + index * (CANVAS.NODE_SPACING + 20),
        y: 200,
        state,
        label: index === 0 ? 'HEAD' : '',
        meta: { index },
      })

      if (index > 0) {
        edges.push({
          id: `edge-${index - 1}-${index}`,
          sourceId: `ll-${index - 1}`,
          targetId: nodeId,
          state: highlightIndices.has(index) ? (highlightIndices.get(index) as VisualEdge['state']) : 'default',
          directed: true,
        })

        if (this.doublyLinked) {
          edges.push({
            id: `edge-${index}-${index - 1}-back`,
            sourceId: nodeId,
            targetId: `ll-${index - 1}`,
            state: 'default',
            directed: true,
            curved: true,
          })
        }
      }

      current = current.next
      index++
    }

    // NULL terminator
    if (nodes.length > 0) {
      const lastIdx = nodes.length - 1
      nodes.push({
        id: 'null-term',
        value: 'NULL' as any,
        x: CANVAS.PADDING + nodes.length * (CANVAS.NODE_SPACING + 20),
        y: 200,
        state: 'default',
        label: '',
        meta: { isNull: true },
      })
      edges.push({
        id: `edge-${lastIdx}-null`,
        sourceId: `ll-${lastIdx}`,
        targetId: 'null-term',
        state: 'default',
        directed: true,
      })
    }

    return { nodes, edges, description }
  }

  insert(value: number, position?: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    const pos = position !== undefined ? Math.min(position, this._size) : this._size

    steps.push(this.createStep(
      this.buildState(new Map(), `Inserting ${value} at position ${pos}`),
      `Inserting ${value} at position ${pos}`, 'insert', 0
    ))

    const newNode: LLNode = { value, next: null, prev: null }

    if (pos === 0) {
      newNode.next = this.head
      if (this.doublyLinked && this.head) this.head.prev = newNode
      this.head = newNode
    } else {
      let current = this.head
      for (let i = 0; i < pos - 1 && current; i++) {
        steps.push(this.createStep(
          this.buildState(new Map([[i, 'comparing']]), `Traversing to position ${pos - 1}`),
          `At node ${i}: ${current.value}`, 'insert', 1
        ))
        current = current.next
      }

      if (current) {
        newNode.next = current.next
        if (this.doublyLinked) {
          newNode.prev = current
          if (current.next) current.next.prev = newNode
        }
        current.next = newNode
      }
    }

    this._size++

    steps.push(this.createStep(
      this.buildState(new Map([[pos, 'inserting']]), `Inserted ${value} at position ${pos}`),
      `Inserted ${value}`, 'insert', 2
    ))

    steps.push(this.createStep(
      this.buildState(new Map(), `List size: ${this._size}`),
      `List size: ${this._size}`, 'insert', 3
    ))

    return steps
  }

  delete(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Searching for ${value} to delete`),
      `Searching for ${value}`, 'delete', 0
    ))

    if (!this.head) {
      steps.push(this.createStep(
        this.buildState(new Map(), `List is empty`),
        `List is empty`, 'delete', 1
      ))
      return steps
    }

    // Check head
    if (this.head.value === value) {
      steps.push(this.createStep(
        this.buildState(new Map([[0, 'found']]), `Found ${value} at head`),
        `Found at head`, 'delete', 1
      ))

      steps.push(this.createStep(
        this.buildState(new Map([[0, 'deleting']]), `Deleting head node`),
        `Deleting head`, 'delete', 2
      ))

      this.head = this.head.next
      if (this.doublyLinked && this.head) this.head.prev = null
      this._size--

      steps.push(this.createStep(
        this.buildState(new Map(), `Deleted ${value}. Size: ${this._size}`),
        `Deleted ${value}`, 'delete', 3
      ))
      return steps
    }

    let current = this.head
    let index = 0

    while (current.next) {
      steps.push(this.createStep(
        this.buildState(new Map([[index, 'comparing']]), `Checking node ${index}: ${current.value}`),
        `Checking: ${current.value}`, 'delete', 1
      ))

      if (current.next.value === value) {
        index++
        steps.push(this.createStep(
          this.buildState(new Map([[index, 'found']]), `Found ${value} at position ${index}`),
          `Found ${value}`, 'delete', 2
        ))

        steps.push(this.createStep(
          this.buildState(new Map([[index, 'deleting']]), `Removing node`),
          `Removing node`, 'delete', 3
        ))

        if (this.doublyLinked && current.next.next) {
          current.next.next.prev = current
        }
        current.next = current.next.next
        this._size--

        steps.push(this.createStep(
          this.buildState(new Map(), `Deleted ${value}. Size: ${this._size}`),
          `Deleted ${value}`, 'delete', 4
        ))
        return steps
      }

      current = current.next
      index++
    }

    steps.push(this.createStep(
      this.buildState(new Map(), `${value} not found`),
      `${value} not found`, 'delete', 5
    ))

    return steps
  }

  search(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Searching for ${value}`),
      `Searching for ${value}`, 'search', 0
    ))

    let current = this.head
    let index = 0

    while (current) {
      const highlights = new Map<number, string>()
      for (let j = 0; j < index; j++) highlights.set(j, 'visited')
      highlights.set(index, current.value === value ? 'found' : 'comparing')

      steps.push(this.createStep(
        this.buildState(highlights, current.value === value ? `Found ${value}!` : `Node ${index}: ${current.value}`),
        current.value === value ? `Found ${value}!` : `Checking: ${current.value}`,
        'search', 1
      ))

      if (current.value === value) return steps
      current = current.next
      index++
    }

    steps.push(this.createStep(
      this.buildState(new Map(), `${value} not found`),
      `${value} not found`, 'search', 2
    ))

    return steps
  }

  reset(): void { this.head = null; this._size = 0; this.stepCounter = 0 }

  generateRandom(count = 6): AnimationStep[] {
    this.head = null
    this._size = 0
    const values = Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1)
    for (const v of values) {
      const newNode: LLNode = { value: v, next: null, prev: null }
      if (!this.head) {
        this.head = newNode
      } else {
        let current = this.head
        while (current.next) current = current.next
        current.next = newNode
        if (this.doublyLinked) newNode.prev = current
      }
      this._size++
    }
    return [this.createStep(
      this.buildState(new Map(), `Generated linked list of ${count} elements`),
      `Generated list of ${count} elements`, 'generate'
    )]
  }

  toArray(): number[] {
    const arr: number[] = []
    let current = this.head
    while (current) { arr.push(current.value); current = current.next }
    return arr
  }

  get size(): number { return this._size }
}
