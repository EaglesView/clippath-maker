'use client'

import { useRef, useCallback, useMemo, MouseEvent } from 'react'
import { Point } from '@/types/clip-path'
import { screenToCanvas, snapToGrid } from '@/lib/canvas-utils'
import { CanvasPoint } from './canvas-point'

interface InteractiveCanvasProps {
  points: Point[]
  selectedPointId?: string
  tool: 'select' | 'addPoint' | 'addCurve'
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  canvasSize: { width: number; height: number }
  onAddPoint: (x: number, y: number) => void
  onUpdatePoint: (id: string, updates: Partial<Point>) => void
  onDeletePoint: (id: string) => void
  onSelectPoint: (id?: string) => void
}

export function InteractiveCanvas({
  points,
  selectedPointId,
  tool,
  showGrid,
  snapToGrid: snapEnabled,
  gridSize,
  canvasSize,
  onAddPoint,
  onUpdatePoint,
  onDeletePoint,
  onSelectPoint
}: InteractiveCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const gridLines = useMemo(() => {
    if (!showGrid) return []

    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
    const step = gridSize

    for (let i = 0; i <= 100; i += step) {
      lines.push(
        { x1: i, y1: 0, x2: i, y2: 100 },
        { x1: 0, y1: i, x2: 100, y2: i }
      )
    }

    return lines
  }, [showGrid, gridSize])

  const pathData = useMemo(() => {
    if (points.length === 0) return ''

    const commands: string[] = []
    const firstPoint = points[0]
    commands.push(`M ${firstPoint.x} ${firstPoint.y}`)

    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      commands.push(`L ${point.x} ${point.y}`)
    }

    commands.push('Z')
    return commands.join(' ')
  }, [points])

  const handleCanvasClick = useCallback((event: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || tool === 'select') return

    const rect = svgRef.current.getBoundingClientRect()
    const canvasCoords = screenToCanvas(
      event.clientX,
      event.clientY,
      rect,
      canvasSize
    )

    const snappedCoords = snapToGrid(
      canvasCoords.x,
      canvasCoords.y,
      gridSize,
      snapEnabled
    )

    // Clamp coordinates to canvas bounds
    const clampedX = Math.max(0, Math.min(100, snappedCoords.x))
    const clampedY = Math.max(0, Math.min(100, snappedCoords.y))

    onAddPoint(clampedX, clampedY)
  }, [tool, canvasSize, gridSize, snapEnabled, onAddPoint])

  const handlePointUpdate = useCallback((id: string, x: number, y: number) => {
    const snappedCoords = snapToGrid(x, y, gridSize, snapEnabled)
    const clampedX = Math.max(0, Math.min(100, snappedCoords.x))
    const clampedY = Math.max(0, Math.min(100, snappedCoords.y))

    onUpdatePoint(id, { x: clampedX, y: clampedY })
  }, [gridSize, snapEnabled, onUpdatePoint])

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="w-full h-96 border border-border rounded-md bg-card cursor-crosshair"
        onClick={handleCanvasClick}
      >
        {/* Grid */}
        {gridLines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeWidth="0.1"
            opacity="0.3"
          />
        ))}

        {/* Path preview */}
        {points.length > 0 && (
          <path
            d={pathData}
            fill="hsl(var(--primary))"
            fillOpacity="0.2"
            stroke="hsl(var(--primary))"
            strokeWidth="0.3"
            strokeDasharray="1 1"
          />
        )}

        {/* Connection lines */}
        {points.length > 1 &&
          points.map((point, index) => {
            const nextPoint = points[(index + 1) % points.length]
            return (
              <line
                key={`connection-${index}`}
                x1={point.x}
                y1={point.y}
                x2={nextPoint.x}
                y2={nextPoint.y}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.2"
                opacity="0.6"
              />
            )
          })}

        {/* Points */}
        {points.map((point, index) => (
          <CanvasPoint
            key={point.id}
            point={point}
            index={index}
            isSelected={selectedPointId === point.id}
            canvasSize={canvasSize}
            tool={tool}
            onUpdate={handlePointUpdate}
            onDelete={() => onDeletePoint(point.id)}
            onSelect={() => onSelectPoint(point.id)}
          />
        ))}
      </svg>

      {/* Instructions */}
      <div className="mt-4 text-xs text-muted-foreground">
        {tool === 'select' && 'Click and drag points to move them. Press Delete to remove selected point.'}
        {tool === 'addPoint' && 'Click anywhere on the canvas to add a corner point.'}
        {tool === 'addCurve' && 'Click anywhere on the canvas to add a smooth curve point.'}
      </div>
    </div>
  )
}