'use client'

import { useState, useCallback } from 'react'
import { ClipPathState, Point, ExportOptions } from '@/types/clip-path'
import { generateId } from '@/lib/canvas-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InteractiveCanvas } from '@/components/canvas/interactive-canvas'
import { Toolbar } from '@/components/panels/toolbar'
import { SettingsPanel } from '@/components/panels/settings-panel'
import { PointProperties } from '@/components/panels/point-properties'
import { PreviewArea } from '@/components/panels/preview-area'
import { CodeOutput } from '@/components/panels/code-output'

const initialState: ClipPathState = {
  points: [
    { id: generateId(), x: 20, y: 20, type: 'flat' },
    { id: generateId(), x: 80, y: 20, type: 'flat' },
    { id: generateId(), x: 80, y: 80, type: 'flat' },
    { id: generateId(), x: 20, y: 80, type: 'flat' }
  ],
  tool: 'select',
  showGrid: true,
  snapToGrid: true,
  gridSize: 5,
  canvasSize: { width: 400, height: 400 }
}

export function ClipPathMaker() {
  const [state, setState] = useState<ClipPathState>(initialState)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'css',
    includeWebkitPrefix: false,
    units: 'percentage'
  })

  const updateState = useCallback((updates: Partial<ClipPathState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const addPoint = useCallback((x: number, y: number, insertIndex?: number) => {
    const newPoint: Point = {
      id: generateId(),
      x,
      y,
      type: 'flat' // All new points start as flat curves
    }

    setState(prev => {
      const points = [...prev.points]
      if (insertIndex !== undefined) {
        // Insert at specific position
        points.splice(insertIndex, 0, newPoint)
      } else {
        // Add to end (fallback)
        points.push(newPoint)
      }

      return {
        ...prev,
        points
      }
    })
  }, [])

  const updatePoint = useCallback((id: string, updates: Partial<Point>) => {
    setState(prev => ({
      ...prev,
      points: prev.points.map(point =>
        point.id === id ? { ...point, ...updates } : point
      )
    }))
  }, [])

  const deletePoint = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      points: prev.points.filter(point => point.id !== id),
      selectedPointId: prev.selectedPointId === id ? undefined : prev.selectedPointId
    }))
  }, [])

  const selectPoint = useCallback((id?: string) => {
    setState(prev => ({ ...prev, selectedPointId: id }))
  }, [])

  const resetCanvas = useCallback(() => {
    setState(initialState)
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Clip Path Maker</h1>
          <p className="text-muted-foreground mt-2">
            Create custom CSS clip-path shapes with an interactive visual editor
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Tools and Settings */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <Toolbar
                  currentTool={state.tool}
                  onToolChange={(tool) => updateState({ tool })}
                  onReset={resetCanvas}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsPanel
                  showGrid={state.showGrid}
                  snapToGrid={state.snapToGrid}
                  gridSize={state.gridSize}
                  onShowGridChange={(showGrid) => updateState({ showGrid })}
                  onSnapToGridChange={(snapToGrid) => updateState({ snapToGrid })}
                  onGridSizeChange={(gridSize) => updateState({ gridSize })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Point Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <PointProperties
                  selectedPoint={state.points.find(p => p.id === state.selectedPointId)}
                  onUpdatePoint={updatePoint}
                  onDeletePoint={deletePoint}
                />
              </CardContent>
            </Card>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-sm">Canvas</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveCanvas
                  points={state.points}
                  selectedPointId={state.selectedPointId}
                  tool={state.tool}
                  showGrid={state.showGrid}
                  snapToGrid={state.snapToGrid}
                  gridSize={state.gridSize}
                  canvasSize={state.canvasSize}
                  onAddPoint={addPoint}
                  onUpdatePoint={updatePoint}
                  onDeletePoint={deletePoint}
                  onSelectPoint={selectPoint}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview and Output */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewArea
                  points={state.points}
                  exportOptions={exportOptions}
                />
              </CardContent>
            </Card>

            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generated CSS</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeOutput
                  points={state.points}
                  exportOptions={exportOptions}
                  onExportOptionsChange={setExportOptions}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}