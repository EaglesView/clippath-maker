'use client'

import { Point } from '@/types/clip-path'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Square, Circle, Triangle } from 'lucide-react'

interface PointPropertiesProps {
  selectedPoint?: Point
  onUpdatePoint: (id: string, updates: Partial<Point>) => void
  onDeletePoint: (id: string) => void
}

export function PointProperties({
  selectedPoint,
  onUpdatePoint,
  onDeletePoint
}: PointPropertiesProps) {
  if (!selectedPoint) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Select a point to edit its properties
      </div>
    )
  }

  const handleTypeChange = (newType: 'flat' | 'smooth' | 'asymmetric') => {
    let updates: Partial<Point> = { type: newType }

    if (newType === 'smooth' || newType === 'asymmetric') {
      // Add default control points if switching to a curved type
      const hasLegacyControls = selectedPoint.controlPoint1 || selectedPoint.controlPoint2
      const hasNewControls = selectedPoint.handleIn || selectedPoint.handleOut

      if (!hasLegacyControls && !hasNewControls) {
        const offset = 12 // Increased default control point offset for better visibility

        if (newType === 'smooth') {
          // Smooth: mirrored handles (symmetric)
          updates = {
            ...updates,
            handleIn: {
              x: Math.max(0, Math.min(100, selectedPoint.x - offset)),
              y: selectedPoint.y
            },
            handleOut: {
              x: Math.max(0, Math.min(100, selectedPoint.x + offset)),
              y: selectedPoint.y
            },
            // Legacy support
            controlPoint1: {
              x: Math.max(0, Math.min(100, selectedPoint.x - offset)),
              y: selectedPoint.y
            },
            controlPoint2: {
              x: Math.max(0, Math.min(100, selectedPoint.x + offset)),
              y: selectedPoint.y
            }
          }
        } else {
          // Asymmetric: independent handles with different positions
          updates = {
            ...updates,
            handleIn: {
              x: Math.max(0, Math.min(100, selectedPoint.x - offset * 0.7)),
              y: Math.max(0, Math.min(100, selectedPoint.y - offset * 0.5))
            },
            handleOut: {
              x: Math.max(0, Math.min(100, selectedPoint.x + offset * 0.7)),
              y: Math.max(0, Math.min(100, selectedPoint.y + offset * 0.5))
            },
            // Legacy support
            controlPoint1: {
              x: Math.max(0, Math.min(100, selectedPoint.x - offset * 0.7)),
              y: Math.max(0, Math.min(100, selectedPoint.y - offset * 0.5))
            },
            controlPoint2: {
              x: Math.max(0, Math.min(100, selectedPoint.x + offset * 0.7)),
              y: Math.max(0, Math.min(100, selectedPoint.y + offset * 0.5))
            }
          }
        }
      }
    } else {
      // Remove all control points for flat type
      updates = {
        ...updates,
        handleIn: undefined,
        handleOut: undefined,
        controlPoint1: undefined,
        controlPoint2: undefined
      }
    }

    onUpdatePoint(selectedPoint.id, updates)
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
          onValueChange={(value) => handleTypeChange(value as any)}
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