'use client'

import { useState } from 'react'
import { ExportOptions } from '@/types/clip-path'
import { useClipPathEditor } from '@/hooks/use-clip-path-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InteractiveCanvas } from '@/components/canvas/interactive-canvas'
import { Toolbar } from '@/components/panels/toolbar'
import { SettingsPanel } from '@/components/panels/settings-panel'
import { PointProperties } from '@/components/panels/point-properties'
import { PreviewArea } from '@/components/panels/preview-area'
import { CodeOutput } from '@/components/panels/code-output'
import { Shapes } from 'lucide-react'

export function ClipPathMaker() {
  const editor = useClipPathEditor()
  const { state } = editor

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'css',
    includeWebkitPrefix: false,
    units: 'percentage',
  })

  return (
    <div className="relative min-h-screen bg-background">
      {/* Blueprint dot-grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:22px_22px] opacity-60"
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Shapes className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Clip&nbsp;Path Maker
              </h1>
              <p className="text-sm text-muted-foreground">
                Draw a shape, get production-ready CSS <code>clip-path</code>.
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-xs text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {state.points.length} points
          </span>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left column — tools, settings, point editing */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <Toolbar
                  currentTool={state.tool}
                  onToolChange={(tool) => editor.updateState({ tool })}
                  onReset={editor.reset}
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
                  onShowGridChange={(showGrid) => editor.updateState({ showGrid })}
                  onSnapToGridChange={(snapToGrid) =>
                    editor.updateState({ snapToGrid })
                  }
                  onGridSizeChange={(gridSize) => editor.updateState({ gridSize })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Point Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <PointProperties
                  selectedPoint={editor.selectedPoint}
                  onUpdatePoint={editor.updatePoint}
                  onDeletePoint={editor.deletePoint}
                />
              </CardContent>
            </Card>
          </div>

          {/* Center — canvas */}
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
                  onAddPoint={editor.addPoint}
                  onUpdatePoint={editor.updatePoint}
                  onDeletePoint={editor.deletePoint}
                  onSelectPoint={editor.selectPoint}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column — preview and generated code */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewArea points={state.points} exportOptions={exportOptions} />
              </CardContent>
            </Card>

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

        <footer className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          Built with Next.js, TypeScript &amp; Tailwind CSS.
        </footer>
      </div>
    </div>
  )
}
