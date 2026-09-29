'use client'

import { useRef, useCallback, useMemo, useState, MouseEvent } from 'react'
import { Point } from '@/types/clip-path'
import { screenToCanvas, snapToGrid, findClosestSegment } from '@/lib/canvas-utils'
import { CanvasPoint } from './canvas-point'

interface InteractiveCanvasProps {
  points: Point[]
  selectedPointId?: string
  tool: 'select' | 'add'
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  canvasSize: { width: number; height: number }
  onAddPoint: (x: number, y: number, insertIndex?: number) => void
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
  const [hoverPreview, setHoverPreview] = useState<{
    point: { x: number; y: number }
    segmentIndex: number
  } | null>(null)

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
      const currentPoint = points[i]
      const prevPoint = points[i - 1]

      // Check if we need to draw a curve (either point has control points)
      const usesCurve =
        (prevPoint.handleOut || prevPoint.controlPoint2) ||
        (currentPoint.handleIn || currentPoint.controlPoint1)

      if (usesCurve) {
        // Get control points - use new handleIn/handleOut if available, fallback to legacy
        const cp1 = prevPoint.handleOut || prevPoint.controlPoint2 || prevPoint
        const cp2 = currentPoint.handleIn || currentPoint.controlPoint1 || currentPoint

        // Proper SVG cubic bezier: C cp1x cp1y, cp2x cp2y, endx endy
        commands.push(`C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${currentPoint.x} ${currentPoint.y}`)
      } else {
        // Use straight line
        commands.push(`L ${currentPoint.x} ${currentPoint.y}`)
      }
    }

    // Close the path - check if we need a curve from last point back to first
    const lastPoint = points[points.length - 1]
    const firstPointAgain = points[0]
    const closingCurve =
      (lastPoint.handleOut || lastPoint.controlPoint2) ||
      (firstPointAgain.handleIn || firstPointAgain.controlPoint1)

    if (closingCurve) {
      const cp1 = lastPoint.handleOut || lastPoint.controlPoint2 || lastPoint
      const cp2 = firstPointAgain.handleIn || firstPointAgain.controlPoint1 || firstPointAgain
      commands.push(`C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${firstPointAgain.x} ${firstPointAgain.y}`)
    } else {
      commands.push('Z')
    }

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

    if (points.length < 2) {
      // If we have fewer than 2 points, just add to the end
      const snappedCoords = snapToGrid(
        canvasCoords.x,
        canvasCoords.y,
        gridSize,
        snapEnabled
      )
      const clampedX = Math.max(0, Math.min(100, snappedCoords.x))
      const clampedY = Math.max(0, Math.min(100, snappedCoords.y))
      onAddPoint(clampedX, clampedY)
      return
    }

    // Find the closest segment to insert the point
    const closestSegment = findClosestSegment(canvasCoords, points)

    if (closestSegment) {
      const snappedCoords = snapToGrid(
        closestSegment.insertionPoint.x,
        closestSegment.insertionPoint.y,
        gridSize,
        snapEnabled
      )
      const clampedX = Math.max(0, Math.min(100, snappedCoords.x))
      const clampedY = Math.max(0, Math.min(100, snappedCoords.y))

      onAddPoint(clampedX, clampedY, closestSegment.insertIndex)
    } else {
      // Fallback: add to end
      const snappedCoords = snapToGrid(
        canvasCoords.x,
        canvasCoords.y,
        gridSize,
        snapEnabled
      )
      const clampedX = Math.max(0, Math.min(100, snappedCoords.x))
      const clampedY = Math.max(0, Math.min(100, snappedCoords.y))
      onAddPoint(clampedX, clampedY)
    }
  }, [tool, canvasSize, gridSize, snapEnabled, points, onAddPoint])

  const handlePointUpdate = useCallback((id: string, x: number, y: number) => {
    const snappedCoords = snapToGrid(x, y, gridSize, snapEnabled)
    const clampedX = Math.max(0, Math.min(100, snappedCoords.x))
    const clampedY = Math.max(0, Math.min(100, snappedCoords.y))

    onUpdatePoint(id, { x: clampedX, y: clampedY })
  }, [gridSize, snapEnabled, onUpdatePoint])

  const handleCanvasMouseMove = useCallback((event: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || tool !== 'add' || points.length < 2) {
      setHoverPreview(null)
      return
    }

    const rect = svgRef.current.getBoundingClientRect()
    const canvasCoords = screenToCanvas(
      event.clientX,
      event.clientY,
      rect,
      canvasSize
    )

    const closestSegment = findClosestSegment(canvasCoords, points)

    if (closestSegment && closestSegment.insertionPoint) {
      const snappedCoords = snapToGrid(
        closestSegment.insertionPoint.x,
        closestSegment.insertionPoint.y,
        gridSize,
        snapEnabled
      )

      setHoverPreview({
        point: {
          x: Math.max(0, Math.min(100, snappedCoords.x)),
          y: Math.max(0, Math.min(100, snappedCoords.y))
        },
        segmentIndex: closestSegment.segmentIndex
      })
    } else {
      setHoverPreview(null)
    }
  }, [tool, points, canvasSize, gridSize, snapEnabled])

  const handleCanvasMouseLeave = useCallback(() => {
    setHoverPreview(null)
  }, [])

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="h-full w-full rounded-xl border border-border bg-card text-muted-foreground shadow-sm cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
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
            fill="var(--primary)"
            fillOpacity="0.2"
            stroke="var(--primary)"
            strokeWidth="0.3"
            strokeDasharray="1 1"
          />
        )}

        {/* Connection lines with curve visualization */}
        {points.length > 1 &&
          points.map((point, index) => {
            const nextPoint = points[(index + 1) % points.length]

            // Check if this segment uses curves
            const usesCurve =
              (point.handleOut || point.controlPoint2) ||
              (nextPoint.handleIn || nextPoint.controlPoint1)

            if (usesCurve) {
              // Draw a subtle curve preview
              const cp1 = point.handleOut || point.controlPoint2 || point
              const cp2 = nextPoint.handleIn || nextPoint.controlPoint1 || nextPoint

              return (
                <path
                  key={`connection-${index}`}
                  d={`M ${point.x} ${point.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${nextPoint.x} ${nextPoint.y}`}
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeWidth="0.15"
                  opacity="0.4"
                  strokeDasharray="0.5 0.5"
                  className="pointer-events-none"
                />
              )
            } else {
              // Draw straight line
              return (
                <line
                  key={`connection-${index}`}
                  x1={point.x}
                  y1={point.y}
                  x2={nextPoint.x}
                  y2={nextPoint.y}
                  stroke="var(--muted-foreground)"
                  strokeWidth="0.2"
                  opacity="0.6"
                />
              )
            }
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
            onUpdatePoint={onUpdatePoint}
            onDelete={() => onDeletePoint(point.id)}
            onSelect={() => onSelectPoint(point.id)}
          />
        ))}

        {/* Hover preview point */}
        {hoverPreview && (
          <g>
            <circle
              cx={hoverPreview.point.x}
              cy={hoverPreview.point.y}
              r={1.0}
              fill="var(--primary)"
              fillOpacity="0.5"
              stroke="var(--primary)"
              strokeWidth="0.2"
              className="pointer-events-none animate-pulse"
            />
            <text
              x={hoverPreview.point.x}
              y={hoverPreview.point.y - 3}
              textAnchor="middle"
              fontSize="1.5"
              fill="var(--primary)"
              className="pointer-events-none select-none font-semibold"
            >
              +
            </text>
          </g>
        )}
      </svg>

      {/* Instructions overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-4">
        <p className="rounded-full border bg-background/80 px-3 py-1.5 text-center text-xs text-muted-foreground shadow-sm backdrop-blur">
          {tool === 'select'
            ? 'Drag points to move them. Press Delete to remove the selected point.'
            : 'Click along the path to add a point at that position.'}
        </p>
      </div>
    </div>
  )
}