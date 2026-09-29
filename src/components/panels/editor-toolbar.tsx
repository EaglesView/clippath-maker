'use client'

import { Point, PointType } from '@/types/clip-path'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MousePointer2, Plus, Minus, Spline, Waypoints } from 'lucide-react'

interface EditorToolbarProps {
  tool: 'select' | 'add'
  onToolChange: (tool: 'select' | 'add') => void
  selectedPoint?: Point
  onChangeType: (id: string, type: PointType) => void
}

const TOOLS = [
  { value: 'select' as const, icon: MousePointer2, label: 'Move points' },
  { value: 'add' as const, icon: Plus, label: 'Add point' },
]

const TYPES: { value: PointType; icon: typeof Minus; label: string }[] = [
  { value: 'flat', icon: Minus, label: 'Straight corner' },
  { value: 'smooth', icon: Spline, label: 'Smooth curve' },
  { value: 'asymmetric', icon: Waypoints, label: 'Asymmetric curve' },
]

export function EditorToolbar({
  tool,
  onToolChange,
  selectedPoint,
  onChangeType,
}: EditorToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5 rounded-full border bg-background/85 p-1 shadow-md backdrop-blur">
        {/* Interaction mode */}
        <ToggleGroup
          type="single"
          value={tool}
          onValueChange={(value) => value && onToolChange(value as 'select' | 'add')}
          variant="outline"
          className="rounded-full border-0 shadow-none"
        >
          {TOOLS.map(({ value, icon: Icon, label }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value={value}
                  aria-label={label}
                  className="size-9 rounded-full border-0 first:rounded-full last:rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Icon className="size-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>

        <div className="mx-0.5 h-6 w-px bg-border" />

        {/* Point type — acts on the selected point */}
        <ToggleGroup
          type="single"
          value={selectedPoint?.type ?? ''}
          onValueChange={(value) =>
            selectedPoint && value && onChangeType(selectedPoint.id, value as PointType)
          }
          variant="outline"
          disabled={!selectedPoint}
          className="rounded-full border-0 shadow-none"
        >
          {TYPES.map(({ value, icon: Icon, label }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value={value}
                  aria-label={label}
                  disabled={!selectedPoint}
                  className="size-9 rounded-full border-0 first:rounded-full last:rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Icon className="size-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {selectedPoint ? label : `${label} — select a point first`}
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>
    </TooltipProvider>
  )
}
