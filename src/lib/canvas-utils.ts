import { Point, ControlPoint } from '@/types/clip-path'

export function screenToCanvas(
  screenX: number,
  screenY: number,
  canvasRect: DOMRect,
  canvasSize: { width: number; height: number }
): { x: number; y: number } {
  const relativeX = screenX - canvasRect.left
  const relativeY = screenY - canvasRect.top

  return {
    x: (relativeX / canvasRect.width) * 100,
    y: (relativeY / canvasRect.height) * 100
  }
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  canvasRect: DOMRect
): { x: number; y: number } {
  return {
    x: canvasRect.left + (canvasX / 100) * canvasRect.width,
    y: canvasRect.top + (canvasY / 100) * canvasRect.height
  }
}

export function snapToGrid(
  x: number,
  y: number,
  gridSize: number,
  enabled: boolean
): { x: number; y: number } {
  if (!enabled) return { x, y }

  const gridStep = gridSize
  return {
    x: Math.round(x / gridStep) * gridStep,
    y: Math.round(y / gridStep) * gridStep
  }
}

export function getDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function isPointNearPoint(
  point: { x: number; y: number },
  target: { x: number; y: number },
  threshold: number = 3
): boolean {
  return getDistance(point, target) <= threshold
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function getBezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): { x: number; y: number } {
  const oneMinusT = 1 - t
  const oneMinusT2 = oneMinusT * oneMinusT
  const oneMinusT3 = oneMinusT2 * oneMinusT
  const t2 = t * t
  const t3 = t2 * t

  return {
    x: oneMinusT3 * p0.x + 3 * oneMinusT2 * t * p1.x + 3 * oneMinusT * t2 * p2.x + t3 * p3.x,
    y: oneMinusT3 * p0.y + 3 * oneMinusT2 * t * p1.y + 3 * oneMinusT * t2 * p2.y + t3 * p3.y
  }
}

export function getClosestPointOnSegment(
  clickPoint: { x: number; y: number },
  segmentStart: { x: number; y: number },
  segmentEnd: { x: number; y: number }
): { point: { x: number; y: number }; distance: number; t: number } {
  const A = clickPoint.x - segmentStart.x
  const B = clickPoint.y - segmentStart.y
  const C = segmentEnd.x - segmentStart.x
  const D = segmentEnd.y - segmentStart.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D

  let t = -1
  if (lenSq !== 0) {
    t = dot / lenSq
  }

  t = clamp(t, 0, 1)

  const projection = {
    x: segmentStart.x + t * C,
    y: segmentStart.y + t * D
  }

  const distance = getDistance(clickPoint, projection)

  return { point: projection, distance, t }
}

export function findClosestSegment(
  clickPoint: { x: number; y: number },
  points: Point[]
): { segmentIndex: number; insertionPoint: { x: number; y: number }; insertIndex: number } | null {
  if (points.length < 2) return null

  let closestDistance = Infinity
  let closestSegmentIndex = -1
  let closestPoint = { x: 0, y: 0 }

  // Check each segment (including the closing segment back to first point)
  for (let i = 0; i < points.length; i++) {
    const currentPoint = points[i]
    const nextPoint = points[(i + 1) % points.length]

    const result = getClosestPointOnSegment(clickPoint, currentPoint, nextPoint)

    if (result.distance < closestDistance) {
      closestDistance = result.distance
      closestSegmentIndex = i
      closestPoint = result.point
    }
  }

  if (closestSegmentIndex === -1) return null

  // The insertion index is after the current segment's start point
  const insertIndex = closestSegmentIndex + 1

  return {
    segmentIndex: closestSegmentIndex,
    insertionPoint: closestPoint,
    insertIndex: insertIndex % points.length === 0 ? points.length : insertIndex
  }
}