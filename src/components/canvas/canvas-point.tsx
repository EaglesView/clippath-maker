'use client'

import { useState, useCallback, useEffect, MouseEvent } from 'react'
import { Point } from '@/types/clip-path'
import { screenToCanvas } from '@/lib/canvas-utils'

interface CanvasPointProps {
  point: Point
  index: number
  isSelected: boolean
  canvasSize: { width: number; height: number }
  tool: 'select' | 'addPoint' | 'addCurve'
  onUpdate: (id: string, x: number, y: number) => void
  onDelete: () => void
  onSelect: () => void
}

export function CanvasPoint({
  point,
  index,
  isSelected,
  canvasSize,
  tool,
  onUpdate,
  onDelete,
  onSelect
}: CanvasPointProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    // Always allow selection, but only allow dragging with select tool
    onSelect()

    if (tool !== 'select') return

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

      onUpdate(point.id, canvasCoords.x, canvasCoords.y)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [point.id, canvasSize, tool, onUpdate, onSelect])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isSelected && (event.key === 'Delete' || event.key === 'Backspace')) {
      onDelete()
    }
  }, [isSelected, onDelete])

  // Add keyboard event listener when selected
  useEffect(() => {
    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSelected, handleKeyDown])

  const pointRadius = isSelected ? 1.5 : 1.2
  const strokeWidth = isSelected ? 0.4 : 0.3

  return (
    <g>
      {/* Point circle */}
      <circle
        cx={point.x}
        cy={point.y}
        r={pointRadius}
        fill={point.type === 'smooth' ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
        stroke={isSelected ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
        strokeWidth={strokeWidth}
        className={`cursor-pointer transition-all ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } hover:fill-primary/80`}
        onMouseDown={handleMouseDown}
      />

      {/* Point label */}
      <text
        x={point.x}
        y={point.y - 2.5}
        textAnchor="middle"
        fontSize="2"
        fill="hsl(var(--muted-foreground))"
        className="pointer-events-none select-none"
      >
        {index + 1}
      </text>

      {/* Selection indicator */}
      {isSelected && (
        <circle
          cx={point.x}
          cy={point.y}
          r={pointRadius + 0.5}
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="0.2"
          strokeDasharray="0.5 0.5"
          className="animate-pulse"
        />
      )}

      {/* Smooth point indicator */}
      {point.type === 'smooth' && (
        <circle
          cx={point.x}
          cy={point.y}
          r={0.4}
          fill="hsl(var(--background))"
          className="pointer-events-none"
        />
      )}
    </g>
  )
}