import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode } from '@/types'
import { CANVAS } from '@/engine/constants'

/**
 * Deque (Double-ended Queue) — supports add/remove from both ends.
 */
export class DequeDS extends DataStructureBase<number> {
  private data: number[] = []

  getVisualizationState(): VisualizationState {
    return this.buildState()
  }

  private buildState(
    highlights: Map<number, string> = new Map(),
    description = ''
  ): VisualizationState {
    const nodes: VisualNode[] = this.data.map((value, index) => ({
      id: `deque-${index}`,
      value,
      x: CANVAS.PADDING + index * CANVAS.ARRAY_CELL_WIDTH,
      y: 200,
      state: (highlights.get(index) || 'default') as VisualNode['state'],
      label: index === 0 ? 'FRONT' : index === this.data.length - 1 ? 'REAR' : '',
      meta: { index },
    }))
    return { nodes, edges: [], description }
  }

  insert(value: number): AnimationStep[] { return this.addRear(value) }

  addFront(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    steps.push(this.createStep(this.buildState(new Map(), `Adding ${value} to front`), `Add front: ${value}`, 'insert', 0))
    this.data.unshift(value)
    steps.push(this.createStep(this.buildState(new Map([[0, 'inserting']]), `Added ${value} at front`), `Added`, 'insert', 1))
    return steps
  }

  addRear(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    steps.push(this.createStep(this.buildState(new Map(), `Adding ${value} to rear`), `Add rear: ${value}`, 'insert', 0))
    this.data.push(value)
    steps.push(this.createStep(this.buildState(new Map([[this.data.length - 1, 'inserting']]), `Added ${value} at rear`), `Added`, 'insert', 1))
    return steps
  }

  delete(_value: number): AnimationStep[] { return this.removeFront() }

  removeFront(): AnimationStep[] {
    const steps: AnimationStep[] = []
    if (this.data.length === 0) { steps.push(this.createStep(this.buildState(new Map(), `Deque is empty`), `Empty`, 'delete', 0)); return steps }
    const v = this.data[0]
    steps.push(this.createStep(this.buildState(new Map([[0, 'deleting']]), `Removing ${v} from front`), `Remove front`, 'delete', 0))
    this.data.shift()
    steps.push(this.createStep(this.buildState(new Map(), `Removed ${v}`), `Removed ${v}`, 'delete', 1))
    return steps
  }

  removeRear(): AnimationStep[] {
    const steps: AnimationStep[] = []
    if (this.data.length === 0) { steps.push(this.createStep(this.buildState(new Map(), `Deque is empty`), `Empty`, 'delete', 0)); return steps }
    const idx = this.data.length - 1
    const v = this.data[idx]
    steps.push(this.createStep(this.buildState(new Map([[idx, 'deleting']]), `Removing ${v} from rear`), `Remove rear`, 'delete', 0))
    this.data.pop()
    steps.push(this.createStep(this.buildState(new Map(), `Removed ${v}`), `Removed ${v}`, 'delete', 1))
    return steps
  }

  search(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    for (let i = 0; i < this.data.length; i++) {
      const h = new Map<number, string>(); for (let j = 0; j < i; j++) h.set(j, 'visited'); h.set(i, this.data[i] === value ? 'found' : 'comparing')
      steps.push(this.createStep(this.buildState(h, this.data[i] === value ? `Found ${value}!` : `Checking [${i}]`), `Check [${i}]`, 'search', 0))
      if (this.data[i] === value) return steps
    }
    steps.push(this.createStep(this.buildState(new Map(), `${value} not found`), `Not found`, 'search', 1))
    return steps
  }

  reset(): void { this.data = []; this.stepCounter = 0 }
  generateRandom(count = 6): AnimationStep[] {
    this.data = Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1)
    return [this.createStep(this.buildState(new Map(), `Generated deque of ${count} elements`), `Generated`, 'generate')]
  }
  toArray(): number[] { return [...this.data] }
}
