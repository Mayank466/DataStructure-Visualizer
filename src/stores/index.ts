import { create } from 'zustand'
import type { DataStructureType } from '@/types'
import type { AnimationStep, VisualizationState, PlaybackStatus } from '@/types'

interface VisualizerState {
  /** Currently selected data structure type */
  selectedDS: DataStructureType
  /** Current visualization state (nodes, edges, highlights) */
  visualState: VisualizationState | null
  /** Whether left sidebar is open (mobile) */
  leftSidebarOpen: boolean
  /** Whether right sidebar is open (mobile) */
  rightSidebarOpen: boolean
  /** Whether bottom panel is expanded */
  bottomPanelExpanded: boolean

  // Actions
  setSelectedDS: (ds: DataStructureType) => void
  setVisualState: (state: VisualizationState | null) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  toggleBottomPanel: () => void
  setLeftSidebar: (open: boolean) => void
  setRightSidebar: (open: boolean) => void
}

import { persist } from 'zustand/middleware'

export const useVisualizerStore = create<VisualizerState>()(
  persist(
    (set) => ({
      selectedDS: 'array',
      visualState: null,
      leftSidebarOpen: false,
      rightSidebarOpen: false,
      bottomPanelExpanded: false,

      setSelectedDS: (ds: DataStructureType) => set({ selectedDS: ds }),
      setVisualState: (state: VisualizationState | null) => set({ visualState: state }),
      toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
      toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
      toggleBottomPanel: () => set((s) => ({ bottomPanelExpanded: !s.bottomPanelExpanded })),
      setLeftSidebar: (open: boolean) => set({ leftSidebarOpen: open }),
      setRightSidebar: (open: boolean) => set({ rightSidebarOpen: open }),
    }),
    {
      name: 'ds-visualizer-storage',
      partialize: (state) => ({ selectedDS: state.selectedDS }), // Only persist selected DS
    }
  )
)

/* ========================================
   ANIMATION STORE
   ======================================== */

interface AnimationState {
  steps: AnimationStep[]
  currentStepIndex: number
  status: PlaybackStatus
  speed: number // multiplier: 0.25, 0.5, 1, 1.5, 2, 4

  // Actions
  setSteps: (steps: AnimationStep[]) => void
  setCurrentStep: (index: number) => void
  setStatus: (status: PlaybackStatus) => void
  setSpeed: (speed: number) => void
  stepForward: () => void
  stepBackward: () => void
  reset: () => void
}

export const useAnimationStore = create<AnimationState>()((set, get) => ({
  steps: [],
  currentStepIndex: -1,
  status: 'idle',
  speed: 1,

  setSteps: (steps: AnimationStep[]) => set({
    steps,
    currentStepIndex: -1,
    status: steps.length > 0 ? 'idle' : 'idle',
  }),

  setCurrentStep: (index: number) => {
    const { steps } = get()
    if (index >= -1 && index < steps.length) {
      set({ currentStepIndex: index })
    }
  },

  setStatus: (status: PlaybackStatus) => set({ status }),
  setSpeed: (speed: number) => set({ speed }),

  stepForward: () => {
    const { currentStepIndex, steps } = get()
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1, status: 'stepping' })
    } else {
      set({ status: 'completed' })
    }
  },

  stepBackward: () => {
    const { currentStepIndex } = get()
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1, status: 'stepping' })
    }
  },

  reset: () => set({
    steps: [],
    currentStepIndex: -1,
    status: 'idle',
  }),
}))

/* ========================================
   HISTORY STORE
   ======================================== */

interface HistoryEntry {
  id: string
  timestamp: number
  operation: string
  description: string
  value?: string | number
}

interface HistoryState {
  entries: HistoryEntry[]
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()((set) => ({
  entries: [],

  addEntry: (entry) =>
    set((state) => ({
      entries: [
        {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
        },
        ...state.entries,
      ].slice(0, 200), // Keep max 200 entries
    })),

  clearHistory: () => set({ entries: [] }),
}))
