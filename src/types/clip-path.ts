export type PointType = 'flat' | 'smooth' | 'asymmetric'

export interface Point {
  id: string
  x: number // 0-100 percentage
  y: number // 0-100 percentage
  type: PointType
  // Incoming control point (affects curve TO this point)
  handleIn?: ControlPoint
  // Outgoing control point (affects curve FROM this point)
  handleOut?: ControlPoint
  // Legacy support - will be migrated
  controlPoint1?: ControlPoint
  controlPoint2?: ControlPoint
}

export interface ControlPoint {
  x: number
  y: number
}

export type ShapeMode = 'polygon' | 'circle' | 'ellipse' | 'inset'

export interface CircleShape {
  mode: 'circle'
  radius: number
  center: { x: number; y: number }
}

export interface EllipseShape {
  mode: 'ellipse'
  radiusX: number
  radiusY: number
  center: { x: number; y: number }
}

export interface InsetShape {
  mode: 'inset'
  top: number
  right: number
  bottom: number
  left: number
  borderRadius?: number
}

export interface PolygonShape {
  mode: 'polygon'
  points: Point[]
}

export type Shape = CircleShape | EllipseShape | InsetShape | PolygonShape

export interface ClipPathState {
  points: Point[]
  selectedPointId?: string
  tool: 'select' | 'add'
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  canvasSize: { width: number; height: number }
}

export type ExportFormat = 'css' | 'svg' | 'json'

export interface ExportOptions {
  format: ExportFormat
  includeWebkitPrefix: boolean
  units: 'percentage' | 'pixels'
}