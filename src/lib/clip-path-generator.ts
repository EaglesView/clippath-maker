import { Point, ExportOptions, Shape } from '@/types/clip-path'

// New function that handles all shape types
export function generateClipPathFromShape(shape: Shape, options: ExportOptions = {
  format: 'css',
  includeWebkitPrefix: false,
  units: 'percentage'
}): string {
  try {
    switch (options.format) {
      case 'css':
        return generateCSSFromShape(shape, options)
      case 'svg':
        return generateSVGFromShape(shape)
      case 'json':
        return JSON.stringify(shape, null, 2)
      default:
        return generateCSSFromShape(shape, options)
    }
  } catch (error) {
    console.error('Error generating clip path from shape:', error)
    return 'clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);'
  }
}

// Legacy function for backward compatibility
export function generateClipPath(points: Point[], options: ExportOptions = {
  format: 'css',
  includeWebkitPrefix: false,
  units: 'percentage'
}): string {
  if (!points || points.length < 3) {
    return 'clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);'
  }

  try {
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
  } catch (error) {
    console.error('Error generating clip path:', error)
    return 'clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);'
  }
}

function generateCSSClipPath(points: Point[], options: ExportOptions): string {
  const hasCurvedPoints = points.some(p => p.type === 'smooth' || p.type === 'asymmetric')

  if (hasCurvedPoints) {
    // For smooth/asymmetric points, we'll approximate with a polygon for now
    // In the future, we can use path() when browser support improves
    const polygonPoints = approximateSmoothedPolygon(points)
    return generatePolygonClipPath(polygonPoints, options)
  } else {
    return generatePolygonClipPath(points, options)
  }
}

function generatePolygonClipPath(points: Point[], options: ExportOptions): string {
  const unit = options.units === 'percentage' ? '%' : 'px'

  // Ensure we have at least 3 points for a valid polygon
  if (points.length < 3) {
    return `clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);`
  }

  // Generate polygon points with proper formatting
  const polygonPoints = points
    .map(point => {
      const x = Math.max(0, Math.min(100, Number(point.x.toFixed(1))))
      const y = Math.max(0, Math.min(100, Number(point.y.toFixed(1))))
      return `${x}${unit} ${y}${unit}`
    })
    .join(', ')

  const clipPathValue = `polygon(${polygonPoints})`

  const finalCSS = options.includeWebkitPrefix
    ? `-webkit-clip-path: ${clipPathValue};\nclip-path: ${clipPathValue};`
    : `clip-path: ${clipPathValue};`

  return finalCSS
}

// New functions for handling different shape types
function generateCSSFromShape(shape: Shape, options: ExportOptions): string {
  const unit = options.units === 'percentage' ? '%' : 'px'

  let clipPathValue: string

  switch (shape.mode) {
    case 'circle':
      clipPathValue = `circle(${shape.radius}${unit} at ${shape.center.x}${unit} ${shape.center.y}${unit})`
      break

    case 'ellipse':
      clipPathValue = `ellipse(${shape.radiusX}${unit} ${shape.radiusY}${unit} at ${shape.center.x}${unit} ${shape.center.y}${unit})`
      break

    case 'inset':
      const borderRadiusStr = shape.borderRadius ? ` round ${shape.borderRadius}${unit}` : ''
      clipPathValue = `inset(${shape.top}${unit} ${shape.right}${unit} ${shape.bottom}${unit} ${shape.left}${unit}${borderRadiusStr})`
      break

    case 'polygon':
      return generateCSSClipPath(shape.points, options)

    default:
      clipPathValue = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
  }

  const finalCSS = options.includeWebkitPrefix
    ? `-webkit-clip-path: ${clipPathValue};\nclip-path: ${clipPathValue};`
    : `clip-path: ${clipPathValue};`

  return finalCSS
}

function generateSVGFromShape(shape: Shape): string {
  switch (shape.mode) {
    case 'circle':
      return `<circle cx="${shape.center.x}" cy="${shape.center.y}" r="${shape.radius}" />`

    case 'ellipse':
      return `<ellipse cx="${shape.center.x}" cy="${shape.center.y}" rx="${shape.radiusX}" ry="${shape.radiusY}" />`

    case 'inset':
      const width = 100 - shape.left - shape.right
      const height = 100 - shape.top - shape.bottom
      const rx = shape.borderRadius || 0
      return `<rect x="${shape.left}" y="${shape.top}" width="${width}" height="${height}" rx="${rx}" ry="${rx}" />`

    case 'polygon':
      return generateSVGPath(shape.points)

    default:
      return ''
  }
}

function approximateSmoothedPolygon(points: Point[]): Point[] {
  if (!points.some(p => p.type === 'smooth' || p.type === 'asymmetric')) {
    // No curves to approximate, return original points
    return points
  }

  const approximatedPoints: Point[] = []

  for (let i = 0; i < points.length; i++) {
    const currentPoint = points[i]
    const nextPoint = points[(i + 1) % points.length]

    // Always include the current point
    approximatedPoints.push({
      ...currentPoint,
      type: 'flat' // Convert to flat since we're approximating
    })

    // Check if we need to draw a curve between current and next point
    const currentHasOut = currentPoint.handleOut || currentPoint.controlPoint2
    const nextHasIn = nextPoint.handleIn || nextPoint.controlPoint1
    const usesCurve = currentHasOut || nextHasIn

    if (usesCurve) {
      // Get proper control points for cubic bezier
      const cp1 = currentPoint.handleOut || currentPoint.controlPoint2 || currentPoint
      const cp2 = nextPoint.handleIn || nextPoint.controlPoint1 || nextPoint

      // Sample points along the cubic bezier curve
      const samplesCount = 12 // More samples for better approximation

      for (let s = 1; s <= samplesCount; s++) {
        const t = s / (samplesCount + 1)

        // Cubic bezier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
        const t1 = 1 - t
        const t1_2 = t1 * t1
        const t1_3 = t1_2 * t1
        const t_2 = t * t
        const t_3 = t_2 * t

        const bezierX =
          t1_3 * currentPoint.x +
          3 * t1_2 * t * cp1.x +
          3 * t1 * t_2 * cp2.x +
          t_3 * nextPoint.x

        const bezierY =
          t1_3 * currentPoint.y +
          3 * t1_2 * t * cp1.y +
          3 * t1 * t_2 * cp2.y +
          t_3 * nextPoint.y

        approximatedPoints.push({
          id: `${currentPoint.id}_curve_${s}`,
          x: Math.max(0, Math.min(100, bezierX)),
          y: Math.max(0, Math.min(100, bezierY)),
          type: 'flat'
        })
      }
    }
  }

  return approximatedPoints
}

function generateSVGPath(points: Point[]): string {
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