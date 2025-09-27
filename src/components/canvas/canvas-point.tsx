'use client'

import { useState, useCallback, useEffect, MouseEvent } from 'react'
import { Point, ControlPoint } from '@/types/clip-path'
import { screenToCanvas } from '@/lib/canvas-utils'
import { ControlHandle } from './control-handle'

interface CanvasPointProps {
  point: Point
  index: number
  isSelected: boolean
  canvasSize: { width: number; height: number }
  tool: 'select' | 'add'
  onUpdate: (id: string, x: number, y: number) => void
  onUpdatePoint: (id: string, updates: Partial<Point>) => void
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
  onUpdatePoint,
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

  const handleHandleInUpdate = useCallback((controlPoint: ControlPoint) => {
    const updates: Partial<Point> = {
      handleIn: controlPoint,
      controlPoint1: controlPoint // Legacy support
    }

    // For smooth points, mirror the handle
    if (point.type === 'smooth') {
      const mirroredHandle = {
        x: point.x + (point.x - controlPoint.x),
        y: point.y + (point.y - controlPoint.y)
      }
      updates.handleOut = mirroredHandle
      updates.controlPoint2 = mirroredHandle // Legacy support
    }

    onUpdatePoint(point.id, updates)
  }, [point.id, point.type, point.x, point.y, onUpdatePoint])

  const handleHandleOutUpdate = useCallback((controlPoint: ControlPoint) => {
    const updates: Partial<Point> = {
      handleOut: controlPoint,
      controlPoint2: controlPoint // Legacy support
    }

    // For smooth points, mirror the handle
    if (point.type === 'smooth') {
      const mirroredHandle = {
        x: point.x + (point.x - controlPoint.x),
        y: point.y + (point.y - controlPoint.y)
      }
      updates.handleIn = mirroredHandle
      updates.controlPoint1 = mirroredHandle // Legacy support
    }

    onUpdatePoint(point.id, updates)
  }, [point.id, point.type, point.x, point.y, onUpdatePoint])

  const pointRadius = isSelected ? 1.5 : 1.2
  const strokeWidth = isSelected ? 0.4 : 0.3
  const shouldShowControlHandles = isSelected && (point.type === 'smooth' || point.type === 'asymmetric') && tool === 'select'

  return (
    <g>
      {/* Point circle */}
      <circle
        cx={point.x}
        cy={point.y}
        r={pointRadius}
        fill={point.type !== 'flat' ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
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

      {/* Curve type indicator */}
      {point.type === 'smooth' && (
        <circle
          cx={point.x}
          cy={point.y}
          r={0.4}
          fill="hsl(var(--background))"
          className="pointer-events-none"
        />
      )}
      {point.type === 'asymmetric' && (
        <rect
          x={point.x - 0.3}
          y={point.y - 0.3}
          width={0.6}
          height={0.6}
          fill="hsl(var(--background))"
          className="pointer-events-none"
        />
      )}

      {/* Control handles */}
      {shouldShowControlHandles && (point.handleIn || point.controlPoint1) && (
        <ControlHandle
          parentPoint={point}
          controlPoint={point.handleIn || point.controlPoint1!}
          canvasSize={canvasSize}
          isVisible={true}
          handleType="in"
          onUpdate={handleHandleInUpdate}
        />
      )}
      {shouldShowControlHandles && (point.handleOut || point.controlPoint2) && (
        <ControlHandle
          parentPoint={point}
          controlPoint={point.handleOut || point.controlPoint2!}
          canvasSize={canvasSize}
          isVisible={true}
          handleType="out"
          onUpdate={handleHandleOutUpdate}
        />
      )}
    </g>
  )
}