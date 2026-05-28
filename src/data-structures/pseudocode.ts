import type { OperationType, DataStructureType } from '@/types'

export interface PseudocodeBlock {
  lines: string[]
  time: string
  space: string
}

type DSPseudocodeMap = Partial<Record<OperationType, PseudocodeBlock>>

const genericMap: DSPseudocodeMap = {
  insert: {
    lines: [
      'function insert(value):',
      '  step 1: identify position',
      '  step 2: place value',
      '  step 3: update size'
    ],
    time: 'O(n)', space: 'O(1)'
  },
  delete: {
    lines: [
      'function delete(value):',
      '  step 1: find value',
      '  step 2: remove value',
      '  step 3: update size'
    ],
    time: 'O(n)', space: 'O(1)'
  },
  search: {
    lines: [
      'function search(value):',
      '  for each item in collection:',
      '    if item == value:',
      '      return true',
      '  return false'
    ],
    time: 'O(n)', space: 'O(1)'
  }
}

const arrayMap: DSPseudocodeMap = {
  insert: {
    lines: [
      'function insert(index, value):',
      '  for i = size down to index:',
      '    arr[i] = arr[i-1]',
      '  arr[index] = value',
      '  size = size + 1'
    ],
    time: 'O(n)', space: 'O(1)'
  },
  delete: {
    lines: [
      'function delete(index):',
      '  for i = index to size - 1:',
      '    arr[i] = arr[i+1]',
      '  size = size - 1'
    ],
    time: 'O(n)', space: 'O(1)'
  },
  search: {
    lines: [
      'function search(value):',
      '  for i = 0 to size - 1:',
      '    if arr[i] == value:',
      '      return i',
      '  return -1'
    ],
    time: 'O(n)', space: 'O(1)'
  }
}

const bstMap: DSPseudocodeMap = {
  insert: {
    lines: [
      'function insert(node, value):',
      '  if node is null:',
      '    return new Node(value)',
      '  if value < node.value:',
      '    node.left = insert(node.left, value)',
      '  else if value > node.value:',
      '    node.right = insert(node.right, value)',
      '  return node'
    ],
    time: 'O(log n)', space: 'O(log n)'
  },
  delete: {
    lines: [
      'function delete(node, value):',
      '  if value < node.value: go left',
      '  else if value > node.value: go right',
      '  else: // Node found',
      '    if missing a child: return the other child',
      '    else: ',
      '      swap value with inorder successor',
      '      delete inorder successor'
    ],
    time: 'O(log n)', space: 'O(log n)'
  },
  search: {
    lines: [
      'function search(node, value):',
      '  if node is null: return false',
      '  if node.value == value: return true',
      '  if value < node.value:',
      '    return search(node.left, value)',
      '  else:',
      '    return search(node.right, value)'
    ],
    time: 'O(log n)', space: 'O(log n)'
  },
  traverse: {
    lines: [
      'function traverse(node):',
      '  if node is null: return',
      '  traverse(node.left)',
      '  visit(node)',
      '  traverse(node.right)'
    ],
    time: 'O(n)', space: 'O(h)'
  }
}

const stackMap: DSPseudocodeMap = {
  push: {
    lines: [
      'function push(value):',
      '  if stack is full: return overflow error',
      '  top = top + 1',
      '  stack[top] = value'
    ],
    time: 'O(1)', space: 'O(1)'
  },
  pop: {
    lines: [
      'function pop():',
      '  if stack is empty: return underflow error',
      '  value = stack[top]',
      '  top = top - 1',
      '  return value'
    ],
    time: 'O(1)', space: 'O(1)'
  },
  peek: {
    lines: [
      'function peek():',
      '  if stack is empty: return null',
      '  return stack[top]'
    ],
    time: 'O(1)', space: 'O(1)'
  }
}

const queueMap: DSPseudocodeMap = {
  enqueue: {
    lines: [
      'function enqueue(value):',
      '  if queue is full: return overflow error',
      '  rear = rear + 1',
      '  queue[rear] = value'
    ],
    time: 'O(1)', space: 'O(1)'
  },
  dequeue: {
    lines: [
      'function dequeue():',
      '  if queue is empty: return underflow error',
      '  value = queue[front]',
      '  front = front + 1',
      '  return value'
    ],
    time: 'O(1)', space: 'O(1)'
  },
  peek: {
    lines: [
      'function peek():',
      '  if queue is empty: return null',
      '  return queue[front]'
    ],
    time: 'O(1)', space: 'O(1)'
  }
}

const graphMap: DSPseudocodeMap = {
  ...genericMap,
  bfs: {
    lines: [
      'function bfs(start_node):',
      '  queue = [start_node]',
      '  visited = {start_node: true}',
      '  while queue is not empty:',
      '    current = queue.dequeue()',
      '    for each neighbor of current:',
      '      if neighbor is not visited:',
      '        visited[neighbor] = true',
      '        queue.enqueue(neighbor)'
    ],
    time: 'O(V + E)', space: 'O(V)'
  },
  dfs: {
    lines: [
      'function dfs(start_node):',
      '  stack = [start_node]',
      '  visited = {start_node: true}',
      '  while stack is not empty:',
      '    current = stack.pop()',
      '    for each neighbor of current:',
      '      if neighbor is not visited:',
      '        visited[neighbor] = true',
      '        stack.push(neighbor)'
    ],
    time: 'O(V + E)', space: 'O(V)'
  }
}

export const PSEUDOCODE_DATA: Record<DataStructureType, DSPseudocodeMap> = {
  'array': arrayMap,
  'stack': stackMap,
  'queue': queueMap,
  'linked-list': genericMap,
  'bst': bstMap,
  'avl': bstMap, // Shares basic BST
  'heap': genericMap,
  'graph': graphMap,
  'deque': genericMap,
  'hash-table': genericMap,
  'trie': genericMap,
  'binary-tree': bstMap
}

export function getPseudocode(ds: DataStructureType, op: OperationType): PseudocodeBlock | null {
  return PSEUDOCODE_DATA[ds]?.[op] || genericMap[op] || null
}
