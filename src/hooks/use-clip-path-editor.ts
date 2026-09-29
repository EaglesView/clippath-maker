'use client'

import { useCallback, useMemo, useState } from 'react'
import { ClipPathState, Point, PointType } from '@/types/clip-path'
import { generateId } from '@/lib/canvas-utils'

const clamp = (value: number) => Math.max(0, Math.min(100, value))

/**
 * Builds the point updates for a type change, seeding sensible default control
 * handles when switching to a curved type and stripping them when going flat.
 */
function typeChangeUpdates(point: Point, type: PointType): Partial<Point> {
  if (type === 'flat') {
    return {
      type,
      handleIn: undefined,
      handleOut: undefined,
      controlPoint1: undefined,
      controlPoint2: undefined,
    }
  }

  const hasHandles =
    point.handleIn || point.handleOut || point.controlPoint1 || point.controlPoint2
  if (hasHandles) return { type }

  const offset = 12
  // Smooth handles are mirrored and horizontal; asymmetric ones are offset.
  const [dxIn, dyIn, dxOut, dyOut] =
    type === 'smooth'
      ? [-offset, 0, offset, 0]
      : [-offset * 0.7, -offset * 0.5, offset * 0.7, offset * 0.5]

  const handleIn = { x: clamp(point.x + dxIn), y: clamp(point.y + dyIn) }
  const handleOut = { x: clamp(point.x + dxOut), y: clamp(point.y + dyOut) }

  return {
    type,
    handleIn,
    handleOut,
    controlPoint1: handleIn,
    controlPoint2: handleOut,
  }
}

const DEFAULT_STATE: ClipPathState = {
  points: [
    { id: generateId(), x: 20, y: 20, type: 'flat' },
    { id: generateId(), x: 80, y: 20, type: 'flat' },
    { id: generateId(), x: 80, y: 80, type: 'flat' },
    { id: generateId(), x: 20, y: 80, type: 'flat' },
  ],
  tool: 'select',
  showGrid: true,
  snapToGrid: true,
  gridSize: 5,
  canvasSize: { width: 400, height: 400 },
}

/**
 * Owns all clip-path editor state and mutations. Keeping this in a hook keeps
 * the view components declarative and makes the editing logic easy to test in
 * isolation.
 */
export function useClipPathEditor(initialState: ClipPathState = DEFAULT_STATE) {
  const [state, setState] = useState<ClipPathState>(initialState)

  const updateState = useCallback((updates: Partial<ClipPathState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const addPoint = useCallback((x: number, y: number, insertIndex?: number) => {
    const newPoint: Point = { id: generateId(), x, y, type: 'flat' }

    setState((prev) => {
      const points = [...prev.points]
      if (insertIndex !== undefined) {
        points.splice(insertIndex, 0, newPoint)
      } else {
        points.push(newPoint)
      }
      return { ...prev, points }
    })
  }, [])

  const updatePoint = useCallback((id: string, updates: Partial<Point>) => {
    setState((prev) => ({
      ...prev,
      points: prev.points.map((point) =>
        point.id === id ? { ...point, ...updates } : point
      ),
    }))
  }, [])

  const deletePoint = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      points: prev.points.filter((point) => point.id !== id),
      selectedPointId:
        prev.selectedPointId === id ? undefined : prev.selectedPointId,
    }))
  }, [])

  const selectPoint = useCallback((id?: string) => {
    setState((prev) => ({ ...prev, selectedPointId: id }))
  }, [])

  const setPointType = useCallback((id: string, type: PointType) => {
    setState((prev) => ({
      ...prev,
      points: prev.points.map((point) =>
        point.id === id ? { ...point, ...typeChangeUpdates(point, type) } : point
      ),
    }))
  }, [])

  const reset = useCallback(() => setState(initialState), [initialState])

  const selectedPoint = useMemo(
    () => state.points.find((point) => point.id === state.selectedPointId),
    [state.points, state.selectedPointId]
  )

  return {
    state,
    selectedPoint,
    updateState,
    addPoint,
    updatePoint,
    deletePoint,
    selectPoint,
    setPointType,
    reset,
  }
}
