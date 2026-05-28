import { motion } from 'motion/react'
import { getPseudocode } from '@/data-structures/pseudocode'
import type { DataStructureType, OperationType } from '@/types'
import { FileCode2 } from 'lucide-react'

interface PseudocodePanelProps {
  dsType: DataStructureType
  operation: OperationType
  activeLine?: number
}

/**
 * Educational component displaying syntax-highlighted pseudocode
 * for the current operation, synchronized with the animation.
 */
export function PseudocodePanel({ dsType, operation, activeLine = -1 }: PseudocodePanelProps) {
  let pseudo = getPseudocode(dsType, operation)
  let displayOp = operation

  // Fallback to a default operation if the current one has no pseudocode (e.g., 'generate', 'reset')
  if (!pseudo) {
    const defaultOps: Record<string, OperationType> = {
      'stack': 'push',
      'queue': 'enqueue',
      'graph': 'bfs'
    }
    displayOp = defaultOps[dsType] || 'insert'
    pseudo = getPseudocode(dsType, displayOp)
  }

  if (!pseudo) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <FileCode2 size={24} className="mb-2 opacity-50" />
        <p>No pseudocode available for this data structure.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full">
      {/* Code Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-5 tracking-wide">
        <div className="mb-3 font-semibold flex items-center justify-between text-sm" style={{ color: 'var(--color-primary-500)' }}>
          <span>{displayOp.toUpperCase()} ALGORITHM</span>
          <div className="flex gap-4 text-xs uppercase">
            <span style={{ color: 'var(--text-secondary)' }}>Time: <span style={{ color: 'var(--color-warning-500)' }}>{pseudo.time}</span></span>
            <span style={{ color: 'var(--text-secondary)' }}>Space: <span style={{ color: 'var(--color-accent-500)' }}>{pseudo.space}</span></span>
          </div>
        </div>
        
        <div className="relative">
          {pseudo.lines.map((line, idx) => {
            const isActive = activeLine === idx
            return (
              <div
                key={idx}
                className="flex rounded-sm px-2 py-1 transition-colors relative z-10"
                style={{
                  background: isActive ? 'var(--bg-active)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                <span className="w-8 shrink-0 opacity-50 text-[11px] select-none pt-[1px]">{idx + 1}</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            )
          })}
          
          {/* Active line background highlight (animated) */}
          {activeLine >= 0 && activeLine < pseudo.lines.length && (
            <motion.div
              className="absolute left-0 right-0 h-[28px] rounded-sm z-0"
              style={{ background: 'var(--bg-hover)', borderLeft: '3px solid var(--color-primary-500)' }}
              initial={{ y: activeLine * 28 }}
              animate={{ y: activeLine * 28 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
