import type { AnimationStep, VisualizationState, OperationType } from '@/types'

/**
 * Abstract base class for all data structures.
 * Each subclass implements operations that produce AnimationStep[] traces.
 * 
 * Design: Pure logic — no React, no DOM. Framework-agnostic.
 * Each operation mutates internal state and returns an animation trace
 * that the AnimationScheduler can play back.
 */
export abstract class DataStructureBase<T = number> {
  /** Unique counter for generating step IDs */
  protected stepCounter = 0

  /** Generate a unique step ID */
  protected nextStepId(): string {
    return `step-${++this.stepCounter}`
  }

  /** Create an AnimationStep from the current state + description */
  protected createStep(
    state: VisualizationState,
    description: string,
    operationType: OperationType,
    codeLine?: number
  ): AnimationStep {
    return {
      id: this.nextStepId(),
      state: structuredClone(state),
      description,
      operationType,
      codeLine,
    }
  }

  // ── Abstract operations ─────────────────────────────

  /** Insert a value and return animation steps */
  abstract insert(value: T): AnimationStep[]

  /** Delete a value and return animation steps */
  abstract delete(value: T): AnimationStep[]

  /** Search for a value and return animation steps */
  abstract search(value: T): AnimationStep[]

  /** Get the current visualization state */
  abstract getVisualizationState(): VisualizationState

  /** Reset to empty state */
  abstract reset(): void

  /** Generate random data */
  abstract generateRandom(count?: number): AnimationStep[]

  /** Get the internal data as an array (for display/debug) */
  abstract toArray(): T[]
}
