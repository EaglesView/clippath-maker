'use client'

import { useState } from 'react'
import { ExportOptions } from '@/types/clip-path'
import { useClipPathEditor } from '@/hooks/use-clip-path-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer'
import { InteractiveCanvas } from '@/components/canvas/interactive-canvas'
import { Toolbar } from '@/components/panels/toolbar'
import { SettingsPanel } from '@/components/panels/settings-panel'
import { PointProperties } from '@/components/panels/point-properties'
import { PreviewArea } from '@/components/panels/preview-area'
import { CodeOutput } from '@/components/panels/code-output'
import { EditorToolbar } from '@/components/panels/editor-toolbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Shapes, SlidersHorizontal, Code2 } from 'lucide-react'

type Editor = ReturnType<typeof useClipPathEditor>

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/** Left-hand editing controls — shared by the desktop sidebar and mobile drawer. */
function ControlsPanels({ editor }: { editor: Editor }) {
  const { state } = editor
  return (
    <>
      <Panel title="Tools">
        <Toolbar
          currentTool={state.tool}
          onToolChange={(tool) => editor.updateState({ tool })}
          onReset={editor.reset}
        />
      </Panel>
      <Panel title="Settings">
        <SettingsPanel
          showGrid={state.showGrid}
          snapToGrid={state.snapToGrid}
          gridSize={state.gridSize}
          onShowGridChange={(showGrid) => editor.updateState({ showGrid })}
          onSnapToGridChange={(snapToGrid) => editor.updateState({ snapToGrid })}
          onGridSizeChange={(gridSize) => editor.updateState({ gridSize })}
        />
      </Panel>
      <Panel title="Point Properties">
        <PointProperties
          selectedPoint={editor.selectedPoint}
          onChangeType={editor.setPointType}
          onDeletePoint={editor.deletePoint}
        />
      </Panel>
    </>
  )
}

/** Right-hand preview + export — shared by the desktop sidebar and mobile drawer. */
function OutputPanels({
  editor,
  exportOptions,
  onExportOptionsChange,
}: {
  editor: Editor
  exportOptions: ExportOptions
  onExportOptionsChange: (options: ExportOptions) => void
}) {
  return (
    <>
      <Panel title="Preview">
        <PreviewArea points={editor.state.points} exportOptions={exportOptions} />
      </Panel>
      <Panel title="Generated CSS">
        <CodeOutput
          points={editor.state.points}
          exportOptions={exportOptions}
          onExportOptionsChange={onExportOptionsChange}
        />
      </Panel>
    </>
  )
}

export function ClipPathMaker() {
  const editor = useClipPathEditor()
  const { state } = editor

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'css',
    includeWebkitPrefix: false,
    units: 'percentage',
  })

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState<'controls' | 'output'>('controls')

  const openDrawer = (tab: 'controls' | 'output') => {
    setDrawerTab(tab)
    setDrawerOpen(true)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Shapes className="size-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-tight">Clip Path Maker</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Visual CSS clip-path editor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 font-mono text-xs text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {state.points.length} pts
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Left sidebar (desktop) */}
        <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r bg-sidebar p-4 lg:flex xl:w-80">
          <ControlsPanels editor={editor} />
        </aside>

        {/* Fullscreen canvas */}
        <main className="relative min-w-0 flex-1 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:22px_22px]"
          />

          {/* Floating top toolbar */}
          <div className="absolute inset-x-0 top-3 z-10 flex justify-center px-4">
            <EditorToolbar
              tool={state.tool}
              onToolChange={(tool) => editor.updateState({ tool })}
              selectedPoint={editor.selectedPoint}
              onChangeType={editor.setPointType}
            />
          </div>

          <div
            className="absolute inset-0 grid place-items-center p-4 sm:p-6 lg:p-8"
            style={{ containerType: 'size' }}
          >
            <div
              className="relative"
              style={{ width: '100cqmin', height: '100cqmin' }}
            >
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
            </div>
          </div>
        </main>

        {/* Right sidebar (desktop) */}
        <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l bg-sidebar p-4 lg:flex xl:w-80">
          <OutputPanels
            editor={editor}
            exportOptions={exportOptions}
            onExportOptionsChange={setExportOptions}
          />
        </aside>
      </div>

      {/* Mobile bottom bar */}
      <nav className="grid shrink-0 grid-cols-2 gap-2 border-t bg-background p-2 lg:hidden">
        <Button
          variant="outline"
          className="h-11 justify-center gap-2"
          onClick={() => openDrawer('controls')}
        >
          <SlidersHorizontal className="size-4" />
          Controls
        </Button>
        <Button
          variant="outline"
          className="h-11 justify-center gap-2"
          onClick={() => openDrawer('output')}
        >
          <Code2 className="size-4" />
          Preview &amp; Code
        </Button>
      </nav>

      {/* Mobile drawer with two tabs */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="lg:hidden">
          <DrawerTitle className="sr-only">Editor panels</DrawerTitle>
          <DrawerDescription className="sr-only">
            Editing controls, preview, and generated code.
          </DrawerDescription>
          <Tabs
            value={drawerTab}
            onValueChange={(value) =>
              setDrawerTab(value as 'controls' | 'output')
            }
            className="flex min-h-0 flex-1 flex-col px-4 pb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="output">Preview &amp; Code</TabsTrigger>
            </TabsList>
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
              <TabsContent value="controls" className="space-y-4">
                <ControlsPanels editor={editor} />
              </TabsContent>
              <TabsContent value="output" className="space-y-4">
                <OutputPanels
                  editor={editor}
                  exportOptions={exportOptions}
                  onExportOptionsChange={setExportOptions}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
