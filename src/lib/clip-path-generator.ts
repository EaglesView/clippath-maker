import { Point, CurvePoint, ExportFormat, ExportOptions } from '@/types/clip-path'

export function generateClipPath(points: Point[], options: ExportOptions = {
  format: 'css',
  includeWebkitPrefix: false,
  units: 'percentage'
}): string {
  if (points.length < 3) {
    return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
  }

  switch (options.format) {
    case 'css':
      return generateCSSClipPath(points, options)
    case 'svg':
      return generateSVGPath(points)
    case 'json':
      return generateJSONExport(points)
    default:
      return generateCSSClipPath(points, options)
  }
}

function generateCSSClipPath(points: Point[], options: ExportOptions): string {
  const hasSmoothedPoints = points.some(p => p.type === 'smooth')

  if (hasSmoothedPoints) {
    // For smooth points, we'll approximate with a polygon for now
    // In the future, we can use path() when browser support improves
    const polygonPoints = approximateSmoothedPolygon(points)
    return generatePolygonClipPath(polygonPoints, options)
  } else {
    return generatePolygonClipPath(points, options)
  }
}

function generatePolygonClipPath(points: Point[], options: ExportOptions): string {
  const unit = options.units === 'percentage' ? '%' : 'px'

  const polygonPoints = points
    .map(point => `${point.x.toFixed(1)}${unit} ${point.y.toFixed(1)}${unit}`)
    .join(', ')

  const clipPathValue = `polygon(${polygonPoints})`

  if (options.includeWebkitPrefix) {
    return `-webkit-clip-path: ${clipPathValue};\nclip-path: ${clipPathValue};`
  }

  return `clip-path: ${clipPathValue};`
}

function approximateSmoothedPolygon(points: Point[]): Point[] {
  // For now, we'll return the original points
  // In a more advanced implementation, we would:
  // 1. Generate bezier curves between smooth points
  // 2. Sample points along those curves
  // 3. Return a denser polygon that approximates the curves
  return points
}

function generateSVGPath(points: Point[]): string {
  if (points.length === 0) return ''

  const commands: string[] = []
  const firstPoint = points[0]

  commands.push(`M ${firstPoint.x} ${firstPoint.y}`)

  for (let i = 1; i < points.length; i++) {
    const point = points[i]

    if (point.type === 'smooth' && 'controlPoint1' in point && 'controlPoint2' in point) {
      const curvePoint = point as CurvePoint
      if (curvePoint.controlPoint1 && curvePoint.controlPoint2) {
        commands.push(`C ${curvePoint.controlPoint1.x} ${curvePoint.controlPoint1.y}, ${curvePoint.controlPoint2.x} ${curvePoint.controlPoint2.y}, ${point.x} ${point.y}`)
      } else {
        commands.push(`L ${point.x} ${point.y}`)
      }
    } else {
      commands.push(`L ${point.x} ${point.y}`)
    }
  }

  commands.push('Z')
  return commands.join(' ')
}

function generateJSONExport(points: Point[]): string {
  return JSON.stringify(points, null, 2)
}

export function generateCSSWithPreview(points: Point[], previewContent: string = 'Preview Content'): string {
  const clipPath = generateClipPath(points)

  return `.clipped-element {
  ${clipPath}

  /* Example usage */
  width: 300px;
  height: 200px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}`
}

export function validatePoints(points: Point[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (points.length < 3) {
    errors.push('A polygon must have at least 3 points')
  }

  // Check for points outside the canvas
  points.forEach((point, index) => {
    if (point.x < 0 || point.x > 100 || point.y < 0 || point.y > 100) {
      errors.push(`Point ${index + 1} is outside the canvas bounds`)
    }
  })

  // Check for duplicate points
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (points[i].x === points[j].x && points[i].y === points[j].y) {
        errors.push(`Points ${i + 1} and ${j + 1} have the same coordinates`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}