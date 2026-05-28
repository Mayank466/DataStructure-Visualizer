import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode } from '@/types'
import { CANVAS } from '@/engine/constants'

/**
 * Queue Data Structure — FIFO with enqueue/dequeue animations.
 */
export class QueueDS extends DataStructureBase<number> {
  private data: number[] = []

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

      return {
        id: `queue-${index}`,
        value,
        x: CANVAS.PADDING + index * CANVAS.ARRAY_CELL_WIDTH,
        y: 200,
        state,
        label: index === 0 ? 'FRONT' : index === this.data.length - 1 ? 'REAR' : '',
        meta: { index },
      }
    })

    return { nodes, edges: [], description }
  }

  insert(value: number): AnimationStep[] { return this.enqueue(value) }

  enqueue(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Enqueueing ${value} at rear`),
      `Enqueueing ${value}`, 'enqueue', 0
    ))

    this.data.push(value)
    const rearIdx = this.data.length - 1

    steps.push(this.createStep(
      this.buildState(new Map([[rearIdx, 'inserting']]), `${value} added to rear`),
      `${value} added at rear`, 'enqueue', 1
    ))

    steps.push(this.createStep(
      this.buildState(new Map(), `Queue size: ${this.data.length}`),
      `Queue size: ${this.data.length}`, 'enqueue', 2
    ))

    return steps
  }

  delete(_value: number): AnimationStep[] { return this.dequeue() }

  dequeue(): AnimationStep[] {
    const steps: AnimationStep[] = []

    if (this.data.length === 0) {
      steps.push(this.createStep(
        this.buildState(new Map(), `Queue is empty`),
        `Queue is empty`, 'dequeue', 0
      ))
      return steps
    }

    const value = this.data[0]

    steps.push(this.createStep(
      this.buildState(new Map([[0, 'active']]), `Dequeueing front element: ${value}`),
      `Dequeueing: ${value}`, 'dequeue', 0
    ))

    steps.push(this.createStep(
      this.buildState(new Map([[0, 'deleting']]), `Removing ${value} from front`),
      `Removing ${value}`, 'dequeue', 1
    ))

    this.data.shift()

    steps.push(this.createStep(
      this.buildState(new Map(), `Dequeued ${value}. Queue size: ${this.data.length}`),
      `Dequeued ${value}`, 'dequeue', 2
    ))

    return steps
  }

  search(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Searching for ${value}`),
      `Searching for ${value}`, 'search', 0
    ))

    for (let i = 0; i < this.data.length; i++) {
      const highlights = new Map<number, string>()
      for (let j = 0; j < i; j++) highlights.set(j, 'visited')
      highlights.set(i, this.data[i] === value ? 'found' : 'comparing')

      steps.push(this.createStep(
        this.buildState(highlights, this.data[i] === value ? `Found ${value}!` : `Checking: ${this.data[i]}`),
        this.data[i] === value ? `Found ${value}!` : `Checking: ${this.data[i]}`,
        'search', 1
      ))

      if (this.data[i] === value) return steps
    }

    const allVisited = new Map<number, string>()
    this.data.forEach((_, i) => allVisited.set(i, 'visited'))
    steps.push(this.createStep(
      this.buildState(allVisited, `${value} not found`),
      `${value} not found`, 'search', 2
    ))

    return steps
  }

  reset(): void { this.data = []; this.stepCounter = 0 }

  generateRandom(count = 6): AnimationStep[] {
    this.data = Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1)
    return [this.createStep(
      this.buildState(new Map(), `Generated queue of ${count} elements`),
      `Generated queue of ${count} elements`, 'generate'
    )]
  }

  toArray(): number[] { return [...this.data] }
  get length(): number { return this.data.length }
}
