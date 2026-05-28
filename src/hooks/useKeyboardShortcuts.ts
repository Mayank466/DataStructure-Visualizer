import { useEffect } from 'react'
import { scheduler } from '@/engine/AnimationScheduler'
import { useAnimationStore, useVisualizerStore } from '@/stores'

/**
 * Global keyboard shortcuts for playback and UI control.
 */
export function useKeyboardShortcuts() {
  const { status, setSpeed, speed } = useAnimationStore()
  const { toggleLeftSidebar, toggleRightSidebar, toggleBottomPanel } = useVisualizerStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (status === 'playing') scheduler.pause()
          else scheduler.play()
          break
        case 'ArrowRight':
          e.preventDefault()
          scheduler.stepForward()
          break
        case 'ArrowLeft':
          e.preventDefault()
          scheduler.stepBackward()
          break
        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            scheduler.stop()
          }
          break
        case 'BracketRight':
          // Speed up
          e.preventDefault()
          setSpeed(Math.min(speed * 2, 4))
          scheduler.setSpeed(Math.min(speed * 2, 4))
          break
        case 'BracketLeft':
          // Slow down
          e.preventDefault()
          setSpeed(Math.max(speed / 2, 0.25))
          scheduler.setSpeed(Math.max(speed / 2, 0.25))
          break
        case 'Period':
          // Ctrl+. to toggle sidebars
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            toggleRightSidebar()
            toggleLeftSidebar()
          }
          break
        case 'KeyH':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            toggleBottomPanel()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, speed, setSpeed, toggleLeftSidebar, toggleRightSidebar, toggleBottomPanel])
}
