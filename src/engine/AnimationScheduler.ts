import type { AnimationStep, PlaybackStatus } from '@/types'
import { DEFAULT_STEP_DURATION } from './constants'

type AnimationCallback = (step: AnimationStep, index: number) => void
type StatusCallback = (status: PlaybackStatus) => void

/**
 * Animation Scheduler — processes AnimationStep[] sequentially.
 * Supports play, pause, resume, step forward/back, and speed control.
 * 
 * Works independently of React — communicates via callbacks.
 */
export class AnimationScheduler {
  private steps: AnimationStep[] = []
  private currentIndex = -1
  private status: PlaybackStatus = 'idle'
  private speed = 1
  private timerId: ReturnType<typeof setTimeout> | null = null

  private onStep: AnimationCallback | null = null
  private onStatusChange: StatusCallback | null = null

  /** Set the callback for each animation step */
  setOnStep(cb: AnimationCallback): void {
    this.onStep = cb
  }

  /** Set the callback for status changes */
  setOnStatusChange(cb: StatusCallback): void {
    this.onStatusChange = cb
  }

  /** Load a new sequence of animation steps */
  loadSteps(steps: AnimationStep[]): void {
    this.stop()
    this.steps = steps
    this.currentIndex = -1
    this.updateStatus('idle')
  }

  /** Set animation speed multiplier */
  setSpeed(speed: number): void {
    this.speed = speed
  }

  /** Start or resume playback */
  play(): void {
    if (this.steps.length === 0) return
    if (this.currentIndex >= this.steps.length - 1) {
      // Restart from beginning if completed
      this.currentIndex = -1
    }
    this.updateStatus('playing')
    this.scheduleNext()
  }

  /** Pause playback */
  pause(): void {
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
    this.updateStatus('paused')
  }

  /** Step forward one step */
  stepForward(): void {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++
      this.emitStep()
      this.updateStatus(
        this.currentIndex >= this.steps.length - 1 ? 'completed' : 'stepping'
      )
    }
  }

  /** Step backward one step */
  stepBackward(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--
      this.emitStep()
      this.updateStatus('stepping')
    }
  }

  /** Stop and reset playback */
  stop(): void {
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
    this.currentIndex = -1
    this.updateStatus('idle')
  }

  /** Get current step index */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /** Get total step count */
  getTotalSteps(): number {
    return this.steps.length
  }

  /** Get current step */
  getCurrentStep(): AnimationStep | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.steps.length) {
      return this.steps[this.currentIndex]
    }
    return null
  }

  // ── Private helpers ─────────────────────────────

  private scheduleNext(): void {
    if (this.status !== 'playing') return
    if (this.currentIndex >= this.steps.length - 1) {
      this.updateStatus('completed')
      return
    }

    const nextIndex = this.currentIndex + 1
    const step = this.steps[nextIndex]
    const duration = (step.duration || DEFAULT_STEP_DURATION) / this.speed

    this.timerId = setTimeout(() => {
      this.currentIndex = nextIndex
      this.emitStep()

      if (this.currentIndex >= this.steps.length - 1) {
        this.updateStatus('completed')
      } else {
        this.scheduleNext()
      }
    }, duration)
  }

  private emitStep(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.steps.length) {
      this.onStep?.(this.steps[this.currentIndex], this.currentIndex)
    }
  }

  private updateStatus(status: PlaybackStatus): void {
    this.status = status
    this.onStatusChange?.(status)
  }
}

/** Singleton scheduler instance */
export const scheduler = new AnimationScheduler()
