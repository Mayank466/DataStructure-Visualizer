import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { AnimationStep, VisualizationState, VisualNode, VisualEdge } from '@/types'

interface TrieNode {
  children: Map<string, TrieNode>
  isEnd: boolean
  char: string
}

/**
 * Trie Data Structure — prefix tree for string operations.
 * Character-by-character insertion/search animation.
 */
export class TrieDS extends DataStructureBase<number> {
  private root: TrieNode = { children: new Map(), isEnd: false, char: '' }
  private words: string[] = []

  getVisualizationState(): VisualizationState {
    return this.buildState()
  }

  private buildState(
    highlightPath: string[] = [],
    description = ''
  ): VisualizationState {
    const nodes: VisualNode[] = []
    const edges: VisualEdge[] = []
    const highlightSet = new Set(highlightPath)

    this.layoutTrie(this.root, 400, 40, 300, 0, nodes, edges, highlightSet, 'root')

    return { nodes, edges, description }
  }

  private layoutTrie(
    node: TrieNode,
    x: number,
    y: number,
    hSpacing: number,
    depth: number,
    nodes: VisualNode[],
    edges: VisualEdge[],
    highlights: Set<string>,
    nodeId: string
  ): void {
    const isHighlighted = highlights.has(nodeId)
    const displayChar = depth === 0 ? '∅' : node.char

    nodes.push({
      id: nodeId,
      value: displayChar as any,
      x,
      y,
      state: isHighlighted ? 'active' : node.isEnd ? 'highlight' : 'default',
      label: node.isEnd ? '✓' : '',
      meta: { depth, isEnd: node.isEnd },
    })

    const children = [...node.children.entries()]
    const totalChildren = children.length
    if (totalChildren === 0) return

    const startX = x - ((totalChildren - 1) * hSpacing) / 2

    children.forEach(([char, child], i) => {
      const childX = startX + i * hSpacing
      const childY = y + 70
      const childId = `${nodeId}-${char}`

      edges.push({
        id: `edge-${nodeId}-${childId}`,
        sourceId: nodeId,
        targetId: childId,
        state: (highlights.has(childId) ? 'active' : 'default') as any,
        directed: true,
        label: char,
      })

      this.layoutTrie(child, childX, childY, hSpacing * 0.6, depth + 1, nodes, edges, highlights, childId)
    })
  }

  /** Insert a word (value is ignored — use insertWord) */
  insert(value: number): AnimationStep[] {
    // Convert number to string for trie insertion
    return this.insertWord(String(value))
  }

  insertWord(word: string): AnimationStep[] {
    const steps: AnimationStep[] = []
    let node = this.root
    const path: string[] = ['root']

    steps.push(this.createStep(
      this.buildState(path, `Inserting "${word}" into trie`),
      `Insert "${word}"`, 'insert', 0
    ))

    for (let i = 0; i < word.length; i++) {
      const char = word[i]

      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), isEnd: false, char })
      }

      node = node.children.get(char)!
      path.push(`${path[path.length - 1]}-${char}`)

      steps.push(this.createStep(
        this.buildState([...path], `Processing character '${char}' (${i + 1}/${word.length})`),
        `Char '${char}'`, 'insert', 1
      ))
    }

    node.isEnd = true

    if (!this.words.includes(word)) this.words.push(word)

    steps.push(this.createStep(
      this.buildState(path, `Marked end of word "${word}"`),
      `"${word}" inserted`, 'insert', 2
    ))

    return steps
  }

  delete(value: number): AnimationStep[] {
    return this.deleteWord(String(value))
  }

  deleteWord(word: string): AnimationStep[] {
    const steps: AnimationStep[] = []

    steps.push(this.createStep(
      this.buildState([], `Deleting "${word}"`),
      `Delete "${word}"`, 'delete', 0
    ))

    const deleteHelper = (node: TrieNode, index: number): boolean => {
      if (index === word.length) {
        if (!node.isEnd) return false
        node.isEnd = false
        return node.children.size === 0
      }

      const char = word[index]
      const child = node.children.get(char)
      if (!child) return false

      const shouldDelete = deleteHelper(child, index + 1)
      if (shouldDelete) {
        node.children.delete(char)
        return !node.isEnd && node.children.size === 0
      }
      return false
    }

    deleteHelper(this.root, 0)
    this.words = this.words.filter((w) => w !== word)

    steps.push(this.createStep(
      this.buildState([], `Deleted "${word}"`),
      `Deleted "${word}"`, 'delete', 1
    ))

    return steps
  }

  search(value: number): AnimationStep[] {
    return this.searchWord(String(value))
  }

  searchWord(word: string): AnimationStep[] {
    const steps: AnimationStep[] = []
    let node = this.root
    const path: string[] = ['root']

    steps.push(this.createStep(
      this.buildState(path, `Searching for "${word}"`),
      `Search "${word}"`, 'search', 0
    ))

    for (let i = 0; i < word.length; i++) {
      const char = word[i]

      if (!node.children.has(char)) {
        steps.push(this.createStep(
          this.buildState(path, `Character '${char}' not found — "${word}" doesn't exist`),
          `Not found`, 'search', 2
        ))
        return steps
      }

      node = node.children.get(char)!
      path.push(`${path[path.length - 1]}-${char}`)

      steps.push(this.createStep(
        this.buildState([...path], `Found '${char}' (${i + 1}/${word.length})`),
        `Found '${char}'`, 'search', 1
      ))
    }

    if (node.isEnd) {
      steps.push(this.createStep(
        this.buildState(path, `✓ "${word}" exists in trie`),
        `Found "${word}"`, 'search', 3
      ))
    } else {
      steps.push(this.createStep(
        this.buildState(path, `"${word}" is a prefix but not a complete word`),
        `Prefix only`, 'search', 4
      ))
    }

    return steps
  }

  reset(): void {
    this.root = { children: new Map(), isEnd: false, char: '' }
    this.words = []
    this.stepCounter = 0
  }

  generateRandom(count = 5): AnimationStep[] {
    this.reset()
    const sampleWords = ['cat', 'car', 'card', 'care', 'bat', 'bar', 'ball', 'dog', 'do', 'dot', 'done']
    const selected = sampleWords.sort(() => Math.random() - 0.5).slice(0, count)

    for (const word of selected) {
      let node = this.root
      for (const char of word) {
        if (!node.children.has(char)) {
          node.children.set(char, { children: new Map(), isEnd: false, char })
        }
        node = node.children.get(char)!
      }
      node.isEnd = true
      this.words.push(word)
    }

    return [this.createStep(
      this.buildState([], `Generated trie with words: [${selected.join(', ')}]`),
      `Generated trie`, 'generate'
    )]
  }

  toArray(): number[] {
    return this.words.map((_, i) => i)
  }
}
