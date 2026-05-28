import { useCallback, useEffect, useRef } from 'react'
import { scheduler } from '@/engine/AnimationScheduler'
import { useVisualizerStore, useAnimationStore, useHistoryStore } from '@/stores'
import type { AnimationStep } from '@/types'

/**
 * Hook that bridges the AnimationScheduler engine with React/Zustand state.
 * Subscribes to scheduler callbacks and updates stores accordingly.
 */
export function useAnimationPlayer() {
  const setVisualState = useVisualizerStore((s) => s.setVisualState)
  const { speed, setStatus, setSteps, setCurrentStep } = useAnimationStore()
  const addHistoryEntry = useHistoryStore((s) => s.addEntry)
  const isConnected = useRef(false)

  // Connect scheduler callbacks to Zustand stores (once)
  useEffect(() => {
    if (isConnected.current) return
    isConnected.current = true

    scheduler.setOnStep((step: AnimationStep) => {
      setVisualState(step.state)
      setCurrentStep(scheduler.getCurrentIndex())
    })

    scheduler.setOnStatusChange((status) => {
      setStatus(status)
    })
  }, [setVisualState, setCurrentStep, setStatus])

  // Keep scheduler speed in sync with store
  useEffect(() => {
    scheduler.setSpeed(speed)
  }, [speed])

  /** Execute an array of animation steps */
  const executeSteps = useCallback(
    (steps: AnimationStep[], operationLabel?: string) => {
      if (steps.length === 0) return

      // Load into scheduler
      scheduler.loadSteps(steps)
      setSteps(steps)

      // Show the final state immediately as the initial state
      setVisualState(steps[0].state)

      // Log to history
      if (operationLabel) {
        addHistoryEntry({
          operation: steps[0].operationType,
          description: operationLabel,
          value: undefined,
        })
      }

      // Auto-play
      scheduler.play()
    },
    [setSteps, setVisualState, addHistoryEntry]
  )

  const play = useCallback(() => scheduler.play(), [])
  const pause = useCallback(() => scheduler.pause(), [])
  const stop = useCallback(() => scheduler.stop(), [])
  const stepForward = useCallback(() => scheduler.stepForward(), [])
  const stepBackward = useCallback(() => scheduler.stepBackward(), [])

  return {
    executeSteps,
    play,
    pause,
    stop,
    stepForward,
    stepBackward,
  }
}
