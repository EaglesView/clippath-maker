'use client'

import { useState, useMemo, useCallback } from 'react'
import { Point, ExportOptions, ExportFormat } from '@/types/clip-path'
import { generateClipPath, generateCSSWithPreview } from '@/lib/clip-path-generator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface CodeOutputProps {
  points: Point[]
  exportOptions: ExportOptions
  onExportOptionsChange: (options: ExportOptions) => void
}

export function CodeOutput({
  points,
  exportOptions,
  onExportOptionsChange
}: CodeOutputProps) {
  const [copied, setCopied] = useState(false)

  const generatedCode = useMemo(() => {
    return generateClipPath(points, exportOptions)
  }, [points, exportOptions])

  const fullCSSExample = useMemo(() => {
    return generateCSSWithPreview(points)
  }, [points])

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  const handleFormatChange = useCallback((format: ExportFormat) => {
    onExportOptionsChange({ ...exportOptions, format })
  }, [exportOptions, onExportOptionsChange])

  const handleUnitsChange = useCallback((units: 'percentage' | 'pixels') => {
    onExportOptionsChange({ ...exportOptions, units })
  }, [exportOptions, onExportOptionsChange])

  const handleWebkitPrefixChange = useCallback((includeWebkitPrefix: boolean) => {
    onExportOptionsChange({ ...exportOptions, includeWebkitPrefix })
  }, [exportOptions, onExportOptionsChange])

  return (
    <div className="space-y-4">
      {/* Export Options */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Format</Label>
          <Select value={exportOptions.format} onValueChange={handleFormatChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="svg">SVG Path</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {exportOptions.format === 'css' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Units</Label>
              <Select value={exportOptions.units} onValueChange={handleUnitsChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="pixels">Pixels (px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="webkit-prefix" className="text-sm font-medium">
                Include -webkit- prefix
              </Label>
              <Switch
                id="webkit-prefix"
                checked={exportOptions.includeWebkitPrefix}
                onCheckedChange={handleWebkitPrefixChange}
              />
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Code Output */}
      <Tabs defaultValue="generated" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generated">Generated</TabsTrigger>
          <TabsTrigger value="example">Full Example</TabsTrigger>
        </TabsList>

        <TabsContent value="generated" className="space-y-3">
          <div className="relative">
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
              <code>{generatedCode}</code>
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => handleCopy(generatedCode)}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="example" className="space-y-3">
          <div className="relative">
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-words max-h-48">
              <code>{fullCSSExample}</code>
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => handleCopy(fullCSSExample)}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Copy button */}
      <Button
        className="w-full"
        onClick={() => handleCopy(generatedCode)}
        disabled={points.length < 3}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </>
        )}
      </Button>

      {points.length < 3 && (
        <p className="text-xs text-muted-foreground text-center">
          Add at least 3 points to generate a valid clip-path
        </p>
      )}
    </div>
  )
}