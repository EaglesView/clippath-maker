'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

interface SettingsPanelProps {
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  onShowGridChange: (value: boolean) => void
  onSnapToGridChange: (value: boolean) => void
  onGridSizeChange: (value: number) => void
}

export function SettingsPanel({
  showGrid,
  snapToGrid,
  gridSize,
  onShowGridChange,
  onSnapToGridChange,
  onGridSizeChange
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-grid" className="text-sm font-medium">
            Show Grid
          </Label>
          <Switch
            id="show-grid"
            checked={showGrid}
            onCheckedChange={onShowGridChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="snap-to-grid" className="text-sm font-medium">
            Snap to Grid
          </Label>
          <Switch
            id="snap-to-grid"
            checked={snapToGrid}
            onCheckedChange={onSnapToGridChange}
            disabled={!showGrid}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="grid-size" className="text-sm font-medium">
              Grid Size
            </Label>
            <span className="text-xs text-muted-foreground">
              {gridSize}%
            </span>
          </div>
          <Slider
            id="grid-size"
            min={1}
            max={20}
            step={1}
            value={[gridSize]}
            onValueChange={([value]) => onGridSizeChange(value)}
            disabled={!showGrid}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}