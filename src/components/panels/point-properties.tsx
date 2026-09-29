'use client'

import { Point, PointType } from '@/types/clip-path'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Square, Circle, Triangle } from 'lucide-react'

interface PointPropertiesProps {
  selectedPoint?: Point
  onChangeType: (id: string, type: PointType) => void
  onDeletePoint: (id: string) => void
}

export function PointProperties({
  selectedPoint,
  onChangeType,
  onDeletePoint
}: PointPropertiesProps) {
  if (!selectedPoint) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Select a point to edit its properties
      </div>
    )
  }

  const handleTypeChange = (newType: PointType) => {
    onChangeType(selectedPoint.id, newType)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flat':
        return <Square className="w-4 h-4" />
      case 'smooth':
        return <Circle className="w-4 h-4" />
      case 'asymmetric':
        return <Triangle className="w-4 h-4" />
      default:
        return <Square className="w-4 h-4" />
    }
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'flat':
        return 'Sharp corner with straight line segments'
      case 'smooth':
        return 'Smooth curve with symmetrical control handles'
      case 'asymmetric':
        return 'Custom curve with independent control handles'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Point Type</Label>
        <Select
          value={selectedPoint.type}
          onValueChange={(value) => handleTypeChange(value as PointType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                {getTypeIcon(selectedPoint.type)}
                <span className="capitalize">{selectedPoint.type}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                <div>
                  <div>Flat</div>
                  <div className="text-xs text-muted-foreground">Sharp corner</div>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="smooth">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4" />
                <div>
                  <div>Smooth</div>
                  <div className="text-xs text-muted-foreground">Curved</div>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="asymmetric">
              <div className="flex items-center gap-2">
                <Triangle className="w-4 h-4" />
                <div>
                  <div>Asymmetric</div>
                  <div className="text-xs text-muted-foreground">Custom curve</div>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {getTypeDescription(selectedPoint.type)}
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Position</Label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <Label htmlFor="point-x" className="text-xs">X</Label>
            <div className="mt-1 font-mono bg-muted px-2 py-1 rounded text-center">
              {selectedPoint.x.toFixed(1)}%
            </div>
          </div>
          <div>
            <Label htmlFor="point-y" className="text-xs">Y</Label>
            <div className="mt-1 font-mono bg-muted px-2 py-1 rounded text-center">
              {selectedPoint.y.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {(selectedPoint.type === 'smooth' || selectedPoint.type === 'asymmetric') && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-medium">Curve Controls</Label>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Drag the control handles on the canvas to adjust the curve:
              </p>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full border border-destructive bg-background flex items-center justify-center">
                  <span className="text-destructive text-[8px]">←</span>
                </div>
                <span className="text-muted-foreground">Incoming curve handle</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full border border-primary bg-background flex items-center justify-center">
                  <span className="text-primary text-[8px]">→</span>
                </div>
                <span className="text-muted-foreground">Outgoing curve handle</span>
              </div>
              {selectedPoint.type === 'smooth' && (
                <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground">
                  <strong>Smooth:</strong> Handles are mirrored - moving one adjusts the other automatically
                </div>
              )}
              {selectedPoint.type === 'asymmetric' && (
                <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground">
                  <strong>Asymmetric:</strong> Handles move independently for custom curve shapes
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Separator />

      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => onDeletePoint(selectedPoint.id)}
      >
        Delete Point
      </Button>
    </div>
  )
}