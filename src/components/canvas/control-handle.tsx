'use client'

import { useState, useCallback, MouseEvent } from 'react'
import { ControlPoint } from '@/types/clip-path'
import { screenToCanvas } from '@/lib/canvas-utils'

interface ControlHandleProps {
  parentPoint: { x: number; y: number }
  controlPoint: ControlPoint
  canvasSize: { width: number; height: number }
  isVisible: boolean
  handleType: 'in' | 'out'
  onUpdate: (controlPoint: ControlPoint) => void
}

export function ControlHandle({
  parentPoint,
  controlPoint,
  canvasSize,
  isVisible,
  handleType,
  onUpdate
}: ControlHandleProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!isVisible) return

    event.preventDefault()
    event.stopPropagation()

    setIsDragging(true)

    // Get the SVG element at the start of the drag
    const svg = (event.currentTarget as Element).closest('svg')
    if (!svg) return

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const canvasCoords = screenToCanvas(
        moveEvent.clientX,
        moveEvent.clientY,
        rect,
        canvasSize
      )

      // Clamp to canvas bounds
      const clampedX = Math.max(0, Math.min(100, canvasCoords.x))
      const clampedY = Math.max(0, Math.min(100, canvasCoords.y))

      onUpdate({ x: clampedX, y: clampedY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [isVisible, canvasSize, onUpdate])

  if (!isVisible) return null

  return (
    <g>
      {/* Connection line from parent point to control handle */}
      <line
        x1={parentPoint.x}
        y1={parentPoint.y}
        x2={controlPoint.x}
        y2={controlPoint.y}
        stroke="var(--muted-foreground)"
        strokeWidth="0.1"
        strokeDasharray="0.5 0.5"
        opacity="0.7"
        className="pointer-events-none"
      />

      {/* Control handle */}
      <circle
        cx={controlPoint.x}
        cy={controlPoint.y}
        r={0.8}
        fill="var(--background)"
        stroke={handleType === 'in' ? 'var(--destructive)' : 'var(--primary)'}
        strokeWidth="0.2"
        className={`cursor-pointer transition-all ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } hover:fill-primary/20`}
        onMouseDown={handleMouseDown}
      />

      {/* Inner dot with different colors for in/out */}
      <circle
        cx={controlPoint.x}
        cy={controlPoint.y}
        r={0.2}
        fill={handleType === 'in' ? 'var(--destructive)' : 'var(--primary)'}
        className="pointer-events-none"
      />

      {/* Handle type indicator */}
      <text
        x={controlPoint.x}
        y={controlPoint.y - 1.5}
        textAnchor="middle"
        fontSize="1"
        fill={handleType === 'in' ? 'var(--destructive)' : 'var(--primary)'}
        className="pointer-events-none select-none font-bold"
      >
        {handleType === 'in' ? '←' : '→'}
      </text>
    </g>
  )
}