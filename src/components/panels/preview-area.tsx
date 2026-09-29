'use client'

import { useMemo } from 'react'
import { Point, ExportOptions } from '@/types/clip-path'
import { generateClipPath } from '@/lib/clip-path-generator'

interface PreviewAreaProps {
  points: Point[]
  exportOptions: ExportOptions
}

export function PreviewArea({ points, exportOptions }: PreviewAreaProps) {
  const clipPathValue = useMemo(() => {
    if (points.length < 3) return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'

    const polygonFallback = () =>
      `polygon(${points
        .map((point) => `${point.x.toFixed(1)}% ${point.y.toFixed(1)}%`)
        .join(', ')})`

    try {
      // Reuse the generator, then extract just the clip-path value from the CSS.
      const match = generateClipPath(points, exportOptions).match(
        /clip-path:\s*([^;]+)/
      )
      return match ? match[1] : polygonFallback()
    } catch (error) {
      console.error('Error in preview area:', error)
      return polygonFallback()
    }
  }, [points, exportOptions])

  const curveCount = points.filter(
    (p) => p.type === 'smooth' || p.type === 'asymmetric'
  ).length

  return (
    <div className="space-y-4">
      {/* Preview container */}
      <div className="relative">
        <div
          className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-semibold text-sm"
          style={{
            clipPath: clipPathValue
          }}
        >
          Preview
        </div>

        {/* Background pattern to show the clipping */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-md opacity-50">
          <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:8px_8px]" />
        </div>
      </div>

      {/* Alternative previews */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">With Image</div>
          <div
            className="w-full h-16 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmY2YjZiIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM0ZWNkYzQiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNncmFkaWVudCkiIC8+Cjwvc3ZnPg==')] bg-cover bg-center rounded-sm"
            style={{
              clipPath: clipPathValue
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Solid Color</div>
          <div
            className="w-full h-16 bg-emerald-500 rounded-sm"
            style={{
              clipPath: clipPathValue
            }}
          />
        </div>
      </div>

      {/* Points info */}
      <div className="text-xs text-muted-foreground">
        {points.length} point{points.length !== 1 ? 's' : ''} • {curveCount} curve
        {curveCount !== 1 ? 's' : ''}
      </div>
    </div>
  )
}