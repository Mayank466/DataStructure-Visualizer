import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode, VisualEdge } from '@/types'

interface GraphVertex {
  id: number
  x: number
  y: number
}

interface GraphEdge {
  source: number
  target: number
  weight: number
}

/**
 * Graph Data Structure — directed/undirected, weighted, with BFS/DFS/Dijkstra.
 * Uses force-directed-like layout for positioning.
 */
export class GraphDS extends DataStructureBase<number> {
  private vertices: Map<number, GraphVertex> = new Map()
  private adjList: Map<number, GraphEdge[]> = new Map()
  public directed = false
  public weighted = false

  getVisualizationState(): VisualizationState {
    return this.buildState()
  }

  private buildState(
    highlightVertices: Map<number, string> = new Map(),
    description = '',
    highlightEdges: Set<string> = new Set()
  ): VisualizationState {
    const nodes: VisualNode[] = []
    const edges: VisualEdge[] = []

    for (const [id, vertex] of this.vertices) {
      const state = highlightVertices.has(id)
        ? (highlightVertices.get(id) as VisualNode['state'])
        : 'default'

      nodes.push({
        id: `graph-${id}`,
        value: id,
        x: vertex.x,
        y: vertex.y,
        state,
        meta: { vertexId: id },
      })
    }

    const seen = new Set<string>()
    for (const [source, edgeList] of this.adjList) {
      for (const edge of edgeList) {
        const edgeKey = this.directed
          ? `${source}-${edge.target}`
          : `${Math.min(source, edge.target)}-${Math.max(source, edge.target)}`

        if (seen.has(edgeKey)) continue
        seen.add(edgeKey)

        const edgeState = highlightEdges.has(edgeKey) ? 'active' : 'default'

        edges.push({
          id: `edge-${edgeKey}`,
          sourceId: `graph-${source}`,
          targetId: `graph-${edge.target}`,
          state: edgeState as VisualEdge['state'],
          directed: this.directed,
          weight: this.weighted ? edge.weight : undefined,
        })
      }
    }

    return { nodes, edges, description }
  }

  private assignPosition(id: number): { x: number; y: number } {
    const count = this.vertices.size
    const centerX = 400
    const centerY = 250
    const radius = 150 + count * 10
    const angle = (count * 2.4) % (2 * Math.PI)
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  }

  insert(value: number): AnimationStep[] {
    return this.addVertex(value)
  }

  addVertex(id: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    if (this.vertices.has(id)) {
      steps.push(this.createStep(
        this.buildState(new Map([[id, 'error']]), `Vertex ${id} already exists`),
        `Vertex ${id} already exists`, 'insert', 0
      ))
      return steps
    }

    const pos = this.assignPosition(id)
    this.vertices.set(id, { id, x: pos.x, y: pos.y })
    this.adjList.set(id, [])

    steps.push(this.createStep(
      this.buildState(new Map([[id, 'inserting']]), `Added vertex ${id}`),
      `Added vertex ${id}`, 'insert', 0
    ))

    steps.push(this.createStep(
      this.buildState(new Map(), `Graph has ${this.vertices.size} vertices`),
      `Graph: ${this.vertices.size} vertices`, 'insert', 1
    ))

    return steps
  }

  addEdge(source: number, target: number, weight = 1): AnimationStep[] {
    const steps: AnimationStep[] = []

    if (!this.vertices.has(source) || !this.vertices.has(target)) {
      steps.push(this.createStep(
        this.buildState(new Map(), `One or both vertices not found`),
        `Vertices not found`, 'insert', 0
      ))
      return steps
    }

    this.adjList.get(source)!.push({ source, target, weight })
    if (!this.directed) {
      this.adjList.get(target)!.push({ source: target, target: source, weight })
    }

    const edgeKey = this.directed
      ? `${source}-${target}`
      : `${Math.min(source, target)}-${Math.max(source, target)}`

    steps.push(this.createStep(
      this.buildState(
        new Map([[source, 'active'], [target, 'active']]),
        `Added edge ${source} → ${target}${this.weighted ? ` (w=${weight})` : ''}`,
        new Set([edgeKey])
      ),
      `Edge ${source} → ${target}`, 'insert', 0
    ))

    return steps
  }

  delete(value: number): AnimationStep[] {
    return this.removeVertex(value)
  }

  removeVertex(id: number): AnimationStep[] {
    const steps: AnimationStep[] = []

    if (!this.vertices.has(id)) {
      steps.push(this.createStep(
        this.buildState(new Map(), `Vertex ${id} not found`),
        `Not found`, 'delete', 0
      ))
      return steps
    }

    steps.push(this.createStep(
      this.buildState(new Map([[id, 'deleting']]), `Removing vertex ${id} and its edges`),
      `Removing vertex ${id}`, 'delete', 0
    ))

    // Remove all edges involving this vertex
    this.adjList.delete(id)
    for (const [, edgeList] of this.adjList) {
      const filtered = edgeList.filter((e) => e.target !== id)
      edgeList.length = 0
      edgeList.push(...filtered)
    }
    this.vertices.delete(id)

    steps.push(this.createStep(
      this.buildState(new Map(), `Removed vertex ${id}`),
      `Removed vertex ${id}`, 'delete', 1
    ))

    return steps
  }

  search(value: number): AnimationStep[] {
    return this.bfs(value)
  }

  /** BFS traversal from a start vertex */
  bfs(start?: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    const startV = start ?? (this.vertices.keys().next().value as number)

    if (!this.vertices.has(startV)) {
      steps.push(this.createStep(
        this.buildState(new Map(), `Vertex ${startV} not found`),
        `Start vertex not found`, 'bfs', 0
      ))
      return steps
    }

    const visited = new Set<number>()
    const queue: number[] = [startV]
    visited.add(startV)

    steps.push(this.createStep(
      this.buildState(new Map([[startV, 'active']]), `BFS starting from vertex ${startV}`),
      `BFS from ${startV}`, 'bfs', 0
    ))

    while (queue.length > 0) {
      const current = queue.shift()!
      const highlights = new Map<number, string>()
      visited.forEach((v) => highlights.set(v, 'visited'))
      highlights.set(current, 'active')

      steps.push(this.createStep(
        this.buildState(highlights, `Visiting vertex ${current}`),
        `Visit ${current}`, 'bfs', 1
      ))

      const neighbors = this.adjList.get(current) || []
      for (const edge of neighbors) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target)
          queue.push(edge.target)

          const h = new Map<number, string>()
          visited.forEach((v) => h.set(v, 'visited'))
          h.set(edge.target, 'highlight')
          h.set(current, 'active')

          steps.push(this.createStep(
            this.buildState(h, `Discovered vertex ${edge.target}`),
            `Discover ${edge.target}`, 'bfs', 2
          ))
        }
      }
    }

    const allVisited = new Map<number, string>()
    visited.forEach((v) => allVisited.set(v, 'found'))

    steps.push(this.createStep(
      this.buildState(allVisited, `BFS complete. Visited: [${[...visited].join(', ')}]`),
      `BFS complete`, 'bfs', 3
    ))

    return steps
  }

  /** DFS traversal */
  dfs(start?: number): AnimationStep[] {
    const steps: AnimationStep[] = []
    const startV = start ?? (this.vertices.keys().next().value as number)

    if (!this.vertices.has(startV)) return steps

    const visited = new Set<number>()

    steps.push(this.createStep(
      this.buildState(new Map([[startV, 'active']]), `DFS starting from vertex ${startV}`),
      `DFS from ${startV}`, 'dfs', 0
    ))

    const dfsVisit = (v: number) => {
      visited.add(v)
      const h = new Map<number, string>()
      visited.forEach((vis) => h.set(vis, 'visited'))
      h.set(v, 'active')

      steps.push(this.createStep(
        this.buildState(h, `Visiting vertex ${v}`),
        `Visit ${v}`, 'dfs', 1
      ))

      const neighbors = this.adjList.get(v) || []
      for (const edge of neighbors) {
        if (!visited.has(edge.target)) {
          dfsVisit(edge.target)
        }
      }
    }

    dfsVisit(startV)

    const allVisited = new Map<number, string>()
    visited.forEach((v) => allVisited.set(v, 'found'))

    steps.push(this.createStep(
      this.buildState(allVisited, `DFS complete. Visited: [${[...visited].join(', ')}]`),
      `DFS complete`, 'dfs', 2
    ))

    return steps
  }

  reset(): void {
    this.vertices.clear()
    this.adjList.clear()
    this.stepCounter = 0
  }

  generateRandom(count = 6): AnimationStep[] {
    this.reset()
    const ids = Array.from({ length: count }, (_, i) => i + 1)
    for (const id of ids) {
      const angle = ((id - 1) / count) * 2 * Math.PI
      this.vertices.set(id, {
        id,
        x: 400 + 160 * Math.cos(angle),
        y: 250 + 130 * Math.sin(angle),
      })
      this.adjList.set(id, [])
    }

    // Add random edges
    for (let i = 0; i < count * 1.5; i++) {
      const a = ids[Math.floor(Math.random() * count)]
      const b = ids[Math.floor(Math.random() * count)]
      if (a !== b) {
        const exists = this.adjList.get(a)?.some((e) => e.target === b)
        if (!exists) {
          const w = Math.floor(Math.random() * 10) + 1
          this.adjList.get(a)!.push({ source: a, target: b, weight: w })
          if (!this.directed) {
            this.adjList.get(b)!.push({ source: b, target: a, weight: w })
          }
        }
      }
    }

    return [this.createStep(
      this.buildState(new Map(), `Generated graph with ${count} vertices`),
      `Generated graph`, 'generate'
    )]
  }

  toArray(): number[] {
    return [...this.vertices.keys()]
  }
}
