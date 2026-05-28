import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode } from '@/types'
import { CANVAS } from '@/engine/constants'

/**
 * Stack Data Structure — LIFO with push/pop/peek animations.
 */
export class StackDS extends DataStructureBase<number> {
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

      // Stack is rendered vertically, bottom-up
      const visualIndex = this.data.length - 1 - index
      return {
        id: `stack-${index}`,
        value,
        x: 200,
        y: 360 - visualIndex * (CANVAS.ARRAY_CELL_HEIGHT + 4),
        state,
        label: index === this.data.length - 1 ? '← TOP' : '',
        meta: { index, isTop: index === this.data.length - 1 },
      }
    })

    return { nodes, edges: [], description }
  }

  insert(value: number): AnimationStep[] {
    return this.push(value)
  }

  push(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Pushing ${value} onto stack`),
      `Pushing ${value} onto stack`,
      'push', 0
    ))

    this.data.push(value)
    const topIdx = this.data.length - 1

    steps.push(this.createStep(
      this.buildState(new Map([[topIdx, 'inserting']]), `${value} is now the top element`),
      `${value} is now the top element`,
      'push', 1
    ))

    steps.push(this.createStep(
      this.buildState(new Map([[topIdx, 'found']]), `Stack size: ${this.data.length}`),
      `Stack size: ${this.data.length}`,
      'push', 2
    ))

    return steps
  }

  delete(_value: number): AnimationStep[] {
    return this.pop()
  }

  pop(): AnimationStep[] {
    const steps: AnimationStep[] = []

    if (this.data.length === 0) {
      steps.push(this.createStep(
        this.buildState(new Map(), `Stack is empty — nothing to pop`),
        `Stack is empty — nothing to pop`,
        'pop', 0
      ))
      return steps
    }

    const topIdx = this.data.length - 1
    const value = this.data[topIdx]

    steps.push(this.createStep(
      this.buildState(new Map([[topIdx, 'active']]), `Popping top element: ${value}`),
      `Popping top element: ${value}`,
      'pop', 0
    ))

    steps.push(this.createStep(
      this.buildState(new Map([[topIdx, 'deleting']]), `Removing ${value} from stack`),
      `Removing ${value} from stack`,
      'pop', 1
    ))

    this.data.pop()

    steps.push(this.createStep(
      this.buildState(new Map(), `Popped ${value}. Stack size: ${this.data.length}`),
      `Popped ${value}. Stack size: ${this.data.length}`,
      'pop', 2
    ))

    return steps
  }

  search(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Searching for ${value} in stack (top to bottom)`),
      `Searching for ${value} in stack`,
      'search', 0
    ))

    for (let i = this.data.length - 1; i >= 0; i--) {
      const highlights = new Map<number, string>()
      for (let j = this.data.length - 1; j > i; j--) highlights.set(j, 'visited')
      highlights.set(i, this.data[i] === value ? 'found' : 'comparing')

      steps.push(this.createStep(
        this.buildState(highlights, this.data[i] === value ? `Found ${value}!` : `Checking: ${this.data[i]} ≠ ${value}`),
        this.data[i] === value ? `Found ${value}!` : `Checking: ${this.data[i]}`,
        'search', 1
      ))

      if (this.data[i] === value) return steps
    }

    const allVisited = new Map<number, string>()
    this.data.forEach((_, i) => allVisited.set(i, 'visited'))
    steps.push(this.createStep(
      this.buildState(allVisited, `${value} not found in stack`),
      `${value} not found in stack`,
      'search', 2
    ))

    return steps
  }

  reset(): void { this.data = []; this.stepCounter = 0 }

  generateRandom(count = 6): AnimationStep[] {
    this.data = []
    const steps: AnimationStep[] = []
    const values = Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1)

    for (const v of values) {
      this.data.push(v)
      steps.push(this.createStep(
        this.buildState(new Map([[this.data.length - 1, 'inserting']]), `Pushed ${v}`),
        `Pushed ${v}`, 'generate'
      ))
    }

    steps.push(this.createStep(
      this.buildState(new Map(), `Generated stack of ${count} elements`),
      `Generated stack of ${count} elements`, 'generate'
    ))

    return steps
  }

  toArray(): number[] { return [...this.data] }
  get length(): number { return this.data.length }
  peek(): number | undefined { return this.data[this.data.length - 1] }
}
