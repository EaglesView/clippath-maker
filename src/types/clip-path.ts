export interface Point {
  id: string
  x: number // 0-100 percentage
  y: number // 0-100 percentage
  type: 'corner' | 'smooth'
}

export interface ControlPoint {
  x: number
  y: number
}

export interface CurvePoint extends Point {
  type: 'smooth'
  controlPoint1?: ControlPoint
  controlPoint2?: ControlPoint
}

export interface PathSegment {
  point: Point
  isStart?: boolean
  isCurve?: boolean
  controlPoint1?: ControlPoint
  controlPoint2?: ControlPoint
}

export interface ClipPathState {
  points: Point[]
  selectedPointId?: string
  tool: 'select' | 'addPoint' | 'addCurve'
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  canvasSize: { width: number; height: number }
}

export interface CanvasInteractionState {
  isDragging: boolean
  dragStartPos?: { x: number; y: number }
  hoveredPointId?: string
}

export type ExportFormat = 'css' | 'svg' | 'json'

export interface ExportOptions {
  format: ExportFormat
  includeWebkitPrefix: boolean
  units: 'percentage' | 'pixels'
}