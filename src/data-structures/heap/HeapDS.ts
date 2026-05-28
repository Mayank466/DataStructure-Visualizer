import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode } from '@/types'
import { CANVAS } from '@/engine/constants'

/**
 * Heap Data Structure — Min/Max heap with heapify animations.
 * Shows both tree view and array representation.
 */
export class HeapDS extends DataStructureBase<number> {
  private data: number[] = []
  public isMinHeap = true

  private compare(a: number, b: number): boolean {
    return this.isMinHeap ? a < b : a > b
  }

  getVisualizationState(): VisualizationState {
    return this.buildState()
  }

  private buildState(
    highlightIndices: Map<number, string> = new Map(),
    description = ''
  ): VisualizationState {
    const nodes: VisualNode[] = this.data.map((value, index) => {
      const state = highlightIndices.has(index)
        ? (highlightIndices.get(index) as VisualNode['state'])
        : 'default'

      // Tree layout: level = floor(log2(index+1)), position within level
      const level = Math.floor(Math.log2(index + 1))
      const posInLevel = index - (Math.pow(2, level) - 1)
      const maxInLevel = Math.pow(2, level)
      const width = 700
      const spacing = width / (maxInLevel + 1)

      return {
        id: `heap-${index}`,
        value,
        x: spacing * (posInLevel + 1) + 50,
        y: 60 + level * 80,
        state,
        label: index === 0 ? 'ROOT' : `[${index}]`,
        meta: { index, level },
      }
    })

    // Tree edges (parent-child relationships)
    const edges = this.data.slice(1).map((_, i) => {
      const childIdx = i + 1
      const parentIdx = Math.floor((childIdx - 1) / 2)
      return {
        id: `heap-edge-${parentIdx}-${childIdx}`,
        sourceId: `heap-${parentIdx}`,
        targetId: `heap-${childIdx}`,
        state: (highlightIndices.has(childIdx) && highlightIndices.has(parentIdx) ? 'active' : 'default') as any,
        directed: true,
      }
    })

    return { nodes, edges, description }
  }

  insert(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    this.data.push(value)
    let i = this.data.length - 1

    steps.push(this.createStep(
      this.buildState(new Map([[i, 'inserting']]), `Inserted ${value} at index [${i}]`),
      `Insert ${value}`, 'insert', 0
    ))

    // Bubble up
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)

      steps.push(this.createStep(
        this.buildState(new Map([[i, 'comparing'], [parent, 'active']]),
          `Compare ${this.data[i]} with parent ${this.data[parent]}`),
        `Compare with parent`, 'insert', 1
      ))

      if (this.compare(this.data[i], this.data[parent])) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]]

        steps.push(this.createStep(
          this.buildState(new Map([[parent, 'highlight'], [i, 'active']]),
            `Swapped ${this.data[parent]} ↔ ${this.data[i]}`),
          `Swap`, 'swap', 2
        ))

        i = parent
      } else {
        steps.push(this.createStep(
          this.buildState(new Map([[i, 'found']]),
            `Heap property satisfied`),
          `Done`, 'insert', 3
        ))
        break
      }
    }

    steps.push(this.createStep(
      this.buildState(new Map(), `Heap size: ${this.data.length}`),
      `Heap size: ${this.data.length}`, 'insert', 4
    ))

    return steps
  }

  delete(_value: number): AnimationStep[] {
    return this.extractRoot()
  }

  extractRoot(): AnimationStep[] {
    const steps: AnimationStep[] = []

    if (this.data.length === 0) {
      steps.push(this.createStep(
        this.buildState(new Map(), `Heap is empty`),
        `Empty heap`, 'delete', 0
      ))
      return steps
    }

    const rootVal = this.data[0]

    steps.push(this.createStep(
      this.buildState(new Map([[0, 'deleting']]),
        `Extracting root: ${rootVal}`),
      `Extract ${rootVal}`, 'delete', 0
    ))

    this.data[0] = this.data[this.data.length - 1]
    this.data.pop()

    if (this.data.length > 0) {
      // Bubble down
      let i = 0
      while (true) {
        const left = 2 * i + 1
        const right = 2 * i + 2
        let target = i

        if (left < this.data.length && this.compare(this.data[left], this.data[target])) {
          target = left
        }
        if (right < this.data.length && this.compare(this.data[right], this.data[target])) {
          target = right
        }

        if (target === i) break

        steps.push(this.createStep(
          this.buildState(new Map([[i, 'active'], [target, 'comparing']]),
            `Swap ${this.data[i]} with ${this.data[target]}`),
          `Bubble down`, 'heapify', 1
        ))

        ;[this.data[i], this.data[target]] = [this.data[target], this.data[i]]
        i = target
      }
    }

    steps.push(this.createStep(
      this.buildState(new Map(), `Extracted ${rootVal}. Heap size: ${this.data.length}`),
      `Extracted ${rootVal}`, 'delete', 2
    ))

    return steps
  }

  search(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Searching for ${value}`),
      `Search ${value}`, 'search', 0
    ))

    for (let i = 0; i < this.data.length; i++) {
      const h = new Map<number, string>()
      for (let j = 0; j < i; j++) h.set(j, 'visited')
      h.set(i, this.data[i] === value ? 'found' : 'comparing')

      steps.push(this.createStep(
        this.buildState(h, this.data[i] === value ? `Found ${value}!` : `Checking [${i}]: ${this.data[i]}`),
        this.data[i] === value ? `Found!` : `Check [${i}]`,
        'search', 1
      ))

      if (this.data[i] === value) return steps
    }

    steps.push(this.createStep(
      this.buildState(new Map(), `${value} not found`),
      `Not found`, 'search', 2
    ))
    return steps
  }

  reset(): void { this.data = []; this.stepCounter = 0 }

  generateRandom(count = 7): AnimationStep[] {
    this.data = []
    const values = Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1)
    for (const v of values) {
      this.data.push(v)
      let i = this.data.length - 1
      while (i > 0) {
        const p = Math.floor((i - 1) / 2)
        if (this.compare(this.data[i], this.data[p])) {
          [this.data[i], this.data[p]] = [this.data[p], this.data[i]]
          i = p
        } else break
      }
    }
    return [this.createStep(
      this.buildState(new Map(), `Generated ${this.isMinHeap ? 'min' : 'max'} heap with ${count} elements`),
      `Generated heap`, 'generate'
    )]
  }

  toArray(): number[] { return [...this.data] }
}
