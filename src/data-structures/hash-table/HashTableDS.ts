import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode, VisualEdge } from '@/types'
import { CANVAS } from '@/engine/constants'

/**
 * Hash Table Data Structure — with chaining for collision handling.
 */
export class HashTableDS extends DataStructureBase<number> {
  private bucketCount = 7
  private buckets: number[][] = Array.from({ length: 7 }, () => [])

  private hash(value: number): number {
    return value % this.bucketCount
  }

  getVisualizationState(): VisualizationState {
    return this.buildState()
  }

  private buildState(
    highlightBucket: number = -1,
    highlightValue: number = -1,
    highlightState: string = 'default',
    description = ''
  ): VisualizationState {
    const nodes: VisualNode[] = []
    const edges: VisualEdge[] = []

    // Bucket headers
    for (let i = 0; i < this.bucketCount; i++) {
      const bucketId = `bucket-${i}`
      nodes.push({
        id: bucketId,
        value: `[${i}]` as any,
        x: 80,
        y: 60 + i * 60,
        state: i === highlightBucket ? 'active' : 'default',
        label: `h=${i}`,
        meta: { isBucket: true, index: i },
      })

      // Chain elements
      this.buckets[i].forEach((val, j) => {
        const nodeId = `item-${i}-${j}`
        nodes.push({
          id: nodeId,
          value: val,
          x: 200 + j * 70,
          y: 60 + i * 60,
          state: val === highlightValue ? highlightState as any : 'default',
          meta: { bucket: i, chainIndex: j },
        })

        const prevId = j === 0 ? bucketId : `item-${i}-${j - 1}`
        edges.push({
          id: `edge-${prevId}-${nodeId}`,
          sourceId: prevId,
          targetId: nodeId,
          state: 'default',
          directed: true,
        })
      })
    }

    return { nodes, edges, description }
  }

  insert(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    const bucket = this.hash(value)

    steps.push(this.createStep(
      this.buildState(-1, -1, 'default', `Computing hash: ${value} % ${this.bucketCount} = ${bucket}`),
      `hash(${value}) = ${bucket}`, 'hash', 0
    ))

    steps.push(this.createStep(
      this.buildState(bucket, -1, 'default', `Going to bucket [${bucket}]`),
      `Bucket [${bucket}]`, 'insert', 1
    ))

    this.buckets[bucket].push(value)

    steps.push(this.createStep(
      this.buildState(bucket, value, 'inserting', `Inserted ${value} into bucket [${bucket}]`),
      `Inserted ${value}`, 'insert', 2
    ))

    return steps
  }

  delete(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    const bucket = this.hash(value)

    steps.push(this.createStep(
      this.buildState(bucket, value, 'comparing', `hash(${value}) = ${bucket}`),
      `Searching bucket [${bucket}]`, 'delete', 0
    ))

    const idx = this.buckets[bucket].indexOf(value)
    if (idx === -1) {
      steps.push(this.createStep(
        this.buildState(bucket, -1, 'default', `${value} not found in bucket [${bucket}]`),
        `Not found`, 'delete', 1
      ))
    } else {
      steps.push(this.createStep(
        this.buildState(bucket, value, 'deleting', `Removing ${value}`),
        `Removing ${value}`, 'delete', 1
      ))

      this.buckets[bucket].splice(idx, 1)

      steps.push(this.createStep(
        this.buildState(-1, -1, 'default', `Deleted ${value}`),
        `Deleted`, 'delete', 2
      ))
    }

    return steps
  }

  search(value: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    const bucket = this.hash(value)

    steps.push(this.createStep(
      this.buildState(-1, -1, 'default', `hash(${value}) = ${bucket}`),
      `hash(${value}) = ${bucket}`, 'hash', 0
    ))

    steps.push(this.createStep(
      this.buildState(bucket, -1, 'default', `Searching bucket [${bucket}]`),
      `Check bucket [${bucket}]`, 'search', 1
    ))

    for (const v of this.buckets[bucket]) {
      steps.push(this.createStep(
        this.buildState(bucket, v, v === value ? 'found' : 'comparing',
          v === value ? `Found ${value}!` : `${v} ≠ ${value}`),
        v === value ? `Found!` : `${v} ≠ ${value}`,
        'search', 2
      ))
      if (v === value) return steps
    }

    steps.push(this.createStep(
      this.buildState(-1, -1, 'default', `${value} not found`),
      `Not found`, 'search', 3
    ))
    return steps
  }

  reset(): void {
    this.buckets = Array.from({ length: this.bucketCount }, () => [])
    this.stepCounter = 0
  }

  generateRandom(count = 10): AnimationStep[] {
    this.reset()
    for (let i = 0; i < count; i++) {
      const v = Math.floor(Math.random() * 99) + 1
      this.buckets[this.hash(v)].push(v)
    }
    return [this.createStep(
      this.buildState(-1, -1, 'default', `Generated hash table with ${count} values`),
      `Generated hash table`, 'generate'
    )]
  }

  toArray(): number[] {
    return this.buckets.flat()
  }
}
