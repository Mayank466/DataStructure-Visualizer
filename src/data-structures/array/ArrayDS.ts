import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode } from '@/types'
import { CANVAS } from '@/engine/constants'

/**
 * Array Data Structure — implements insert, delete, search with animation traces.
 * 
 * Visualization: horizontal row of cells, each with index label and value.
 * Animations show element shifting, highlighting during search, etc.
 */
export class ArrayDS extends DataStructureBase<number> {
  private data: number[] = []

  /** Build visualization state from current array data */
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
        id: `arr-${index}`,
        value,
        x: CANVAS.PADDING + index * CANVAS.ARRAY_CELL_WIDTH,
        y: 200,
        state,
        label: `[${index}]`,
        meta: { index },
      }
    })

    return { nodes, edges: [], description }
  }

  /** Insert a value at the end (or at a specific index) */
  insert(value: number, index?: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    const insertAt = index !== undefined ? Math.min(index, this.data.length) : this.data.length

    // Step 1: Show current state
    steps.push(this.createStep(
      this.buildState(new Map(), `Inserting ${value} at index [${insertAt}]`),
      `Inserting ${value} at index [${insertAt}]`,
      'insert',
      0
    ))

    // Step 2: If inserting in middle, show elements that need to shift
    if (insertAt < this.data.length) {
      const shiftHighlights = new Map<number, string>()
      for (let i = insertAt; i < this.data.length; i++) {
        shiftHighlights.set(i, 'active')
      }
      steps.push(this.createStep(
        this.buildState(shiftHighlights, `Shifting elements right from index [${insertAt}]`),
        `Shifting elements right from index [${insertAt}]`,
        'insert',
        1
      ))
    }

    // Step 3: Perform the insertion
    this.data.splice(insertAt, 0, value)

    // Step 4: Show the new element highlighted
    steps.push(this.createStep(
      this.buildState(new Map([[insertAt, 'inserting']]), `Inserted ${value} at index [${insertAt}]`),
      `Inserted ${value} at index [${insertAt}]`,
      'insert',
      2
    ))

    // Step 5: Final state
    steps.push(this.createStep(
      this.buildState(new Map([[insertAt, 'found']]), `Array size is now ${this.data.length}`),
      `Array size is now ${this.data.length}`,
      'insert',
      3
    ))

    return steps
  }

  /** Delete a value (first occurrence) */
  delete(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    const index = this.data.indexOf(value)

    // Step 1: Show current state
    steps.push(this.createStep(
      this.buildState(new Map(), `Searching for ${value} to delete`),
      `Searching for ${value} to delete`,
      'delete',
      0
    ))

    if (index === -1) {
      // Not found
      steps.push(this.createStep(
        this.buildState(new Map(), `Value ${value} not found in array`),
        `Value ${value} not found in array`,
        'delete',
        1
      ))
      return steps
    }

    // Step 2: Search through array
    for (let i = 0; i <= index; i++) {
      const highlights = new Map<number, string>()
      for (let j = 0; j < i; j++) highlights.set(j, 'visited')
      highlights.set(i, i === index ? 'found' : 'comparing')

      steps.push(this.createStep(
        this.buildState(highlights, i === index ? `Found ${value} at index [${i}]` : `Checking index [${i}]: ${this.data[i]} ≠ ${value}`),
        i === index ? `Found ${value} at index [${i}]` : `Checking index [${i}]: ${this.data[i]} ≠ ${value}`,
        'delete',
        2
      ))
    }

    // Step 3: Mark for deletion
    steps.push(this.createStep(
      this.buildState(new Map([[index, 'deleting']]), `Deleting ${value} from index [${index}]`),
      `Deleting ${value} from index [${index}]`,
      'delete',
      3
    ))

    // Step 4: Show shift
    if (index < this.data.length - 1) {
      const shiftHighlights = new Map<number, string>()
      shiftHighlights.set(index, 'deleting')
      for (let i = index + 1; i < this.data.length; i++) {
        shiftHighlights.set(i, 'active')
      }
      steps.push(this.createStep(
        this.buildState(shiftHighlights, `Shifting elements left`),
        `Shifting elements left`,
        'delete',
        4
      ))
    }

    // Step 5: Perform deletion
    this.data.splice(index, 1)

    steps.push(this.createStep(
      this.buildState(new Map(), `Deleted ${value}. Array size is now ${this.data.length}`),
      `Deleted ${value}. Array size is now ${this.data.length}`,
      'delete',
      5
    ))

    return steps
  }

  /** Search for a value with linear scan animation */
  search(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState(new Map(), `Searching for ${value}`),
      `Searching for ${value}`,
      'search',
      0
    ))

    for (let i = 0; i < this.data.length; i++) {
      const highlights = new Map<number, string>()
      // Mark previous as visited
      for (let j = 0; j < i; j++) highlights.set(j, 'visited')
      // Mark current as comparing
      highlights.set(i, 'comparing')

      const found = this.data[i] === value
      steps.push(this.createStep(
        this.buildState(
          highlights,
          found ? `Found ${value} at index [${i}]!` : `Checking index [${i}]: ${this.data[i]} ${this.data[i] === value ? '=' : '≠'} ${value}`
        ),
        found ? `Found ${value} at index [${i}]!` : `Checking index [${i}]: ${this.data[i]} ≠ ${value}`,
        'search',
        1
      ))

      if (found) {
        // Highlight found
        const foundHighlights = new Map<number, string>()
        for (let j = 0; j < i; j++) foundHighlights.set(j, 'visited')
        foundHighlights.set(i, 'found')

        steps.push(this.createStep(
          this.buildState(foundHighlights, `✓ Found ${value} at index [${i}]`),
          `✓ Found ${value} at index [${i}]`,
          'search',
          2
        ))
        return steps
      }
    }

    // Not found
    const allVisited = new Map<number, string>()
    for (let i = 0; i < this.data.length; i++) allVisited.set(i, 'visited')

    steps.push(this.createStep(
      this.buildState(allVisited, `✗ Value ${value} not found in array`),
      `✗ Value ${value} not found in array`,
      'search',
      3
    ))

    return steps
  }

  /** Reset array to empty */
  reset(): void {
    this.data = []
    this.stepCounter = 0
  }

  /** Generate random array data */
  generateRandom(count = 8): AnimationStep[] {
    this.data = []
    const steps: AnimationStep[] = []

    const values = Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1)

    steps.push(this.createStep(
      this.buildState(new Map(), `Generating ${count} random values`),
      `Generating ${count} random values`,
      'generate'
    ))

    for (const value of values) {
      this.data.push(value)
      const highlights = new Map<number, string>()
      highlights.set(this.data.length - 1, 'inserting')

      steps.push(this.createStep(
        this.buildState(highlights, `Added ${value}`),
        `Added ${value}`,
        'generate'
      ))
    }

    steps.push(this.createStep(
      this.buildState(new Map(), `Generated array of ${count} elements`),
      `Generated array of ${count} elements`,
      'generate'
    ))

    return steps
  }

  /** Get internal data as array */
  toArray(): number[] {
    return [...this.data]
  }

  /** Get current length */
  get length(): number {
    return this.data.length
  }
}
