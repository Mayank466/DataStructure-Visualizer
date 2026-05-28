import { useRef, useCallback, useEffect, useState } from 'react'
import { useVisualizerStore, useAnimationStore, useHistoryStore } from '@/stores'
import { useAnimationPlayer } from '@/hooks/useAnimationPlayer'
import { ArrayDS } from '@/data-structures/array/ArrayDS'
import { StackDS } from '@/data-structures/stack/StackDS'
import { QueueDS } from '@/data-structures/queue/QueueDS'
import { LinkedListDS } from '@/data-structures/linked-list/LinkedListDS'
import { BSTDS } from '@/data-structures/bst/BSTDS'
import { GraphDS } from '@/data-structures/graph/GraphDS'
import { HeapDS } from '@/data-structures/heap/HeapDS'
import { AVLDS } from '@/data-structures/avl/AVLDS'
import { DequeDS } from '@/data-structures/deque/DequeDS'
import { HashTableDS } from '@/data-structures/hash-table/HashTableDS'
import { TrieDS } from '@/data-structures/trie/TrieDS'
import { DataStructureBase } from '@/data-structures/base/DataStructure'
import type { DataStructureType } from '@/types'

function createDS(type: DataStructureType): DataStructureBase<number> {
  switch (type) {
    case 'array': return new ArrayDS()
    case 'stack': return new StackDS()
    case 'queue': return new QueueDS()
    case 'linked-list': return new LinkedListDS()
    case 'bst': return new BSTDS()
    case 'avl': return new AVLDS()
    case 'graph': return new GraphDS()
    case 'heap': return new HeapDS()
    case 'deque': return new DequeDS()
    case 'hash-table': return new HashTableDS()
    case 'trie': return new TrieDS()
    case 'binary-tree': return new BSTDS() // Reuse BST for generic binary tree
    default: return new ArrayDS()
  }
}

/**
 * Hook that manages the current data structure instance and provides
 * operation functions that integrate with the animation system.
 */
export function useDataStructureController() {
  const selectedDS = useVisualizerStore((s) => s.selectedDS)
  const setVisualState = useVisualizerStore((s) => s.setVisualState)
  const addHistoryEntry = useHistoryStore((s) => s.addEntry)
  const { executeSteps } = useAnimationPlayer()

  const dsRef = useRef<DataStructureBase<number>>(createDS(selectedDS))
  const [dsType, setDsType] = useState<DataStructureType>(selectedDS)

  // Recreate DS instance when selection changes
  useEffect(() => {
    if (selectedDS !== dsType) {
      dsRef.current = createDS(selectedDS)
      setDsType(selectedDS)
      setVisualState(null)
    }
  }, [selectedDS, dsType, setVisualState])

  const handleInsert = useCallback((value: number) => {
    const ds = dsRef.current
    const steps = ds.insert(value)
    addHistoryEntry({ operation: 'insert', description: `Insert ${value}`, value })
    executeSteps(steps)
  }, [executeSteps, addHistoryEntry])

  const handleDelete = useCallback((value: number) => {
    const ds = dsRef.current
    const steps = ds.delete(value)
    addHistoryEntry({ operation: 'delete', description: `Delete ${value}`, value })
    executeSteps(steps)
  }, [executeSteps, addHistoryEntry])

  const handleSearch = useCallback((value: number) => {
    const ds = dsRef.current
    const steps = ds.search(value)
    addHistoryEntry({ operation: 'search', description: `Search ${value}`, value })
    executeSteps(steps)
  }, [executeSteps, addHistoryEntry])

  const handleRandom = useCallback(() => {
    const ds = dsRef.current
    ds.reset()
    const steps = ds.generateRandom()
    addHistoryEntry({ operation: 'generate', description: `Generate random data` })
    executeSteps(steps)
  }, [executeSteps, addHistoryEntry])

  const handleReset = useCallback(() => {
    const ds = dsRef.current
    ds.reset()
    setVisualState(null)
    addHistoryEntry({ operation: 'reset', description: `Reset data structure` })
  }, [setVisualState, addHistoryEntry])

  const handleTraverse = useCallback((order?: string) => {
    const ds = dsRef.current
    if (ds instanceof BSTDS || ds instanceof AVLDS) {
      const steps = (ds as BSTDS).traverse(order as 'inorder' | 'preorder' | 'postorder')
      addHistoryEntry({ operation: 'traverse', description: `${order || 'inorder'} traversal` })
      executeSteps(steps)
    }
    if (ds instanceof GraphDS) {
      const steps = order === 'dfs' ? ds.dfs() : ds.bfs()
      addHistoryEntry({ operation: order === 'dfs' ? 'dfs' : 'bfs', description: `${order?.toUpperCase()} traversal` })
      executeSteps(steps)
    }
  }, [executeSteps, addHistoryEntry])

  return {
    handleInsert,
    handleDelete,
    handleSearch,
    handleRandom,
    handleReset,
    handleTraverse,
    currentDS: dsRef.current,
  }
}
