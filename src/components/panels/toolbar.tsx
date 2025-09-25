'use client'

import { Button } from '@/components/ui/button'
import { MousePointer, Plus, Spline, RotateCcw } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ToolbarProps {
  currentTool: 'select' | 'addPoint' | 'addCurve'
  onToolChange: (tool: 'select' | 'addPoint' | 'addCurve') => void
  onReset: () => void
}

export function Toolbar({ currentTool, onToolChange, onReset }: ToolbarProps) {
  const tools = [
    {
      id: 'select' as const,
      icon: MousePointer,
      label: 'Select & Move',
      description: 'Select and move points'
    },
    {
      id: 'addPoint' as const,
      icon: Plus,
      label: 'Add Point',
      description: 'Add corner points'
    },
    {
      id: 'addCurve' as const,
      icon: Spline,
      label: 'Add Curve',
      description: 'Add smooth curve points'
    }
  ]

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentTool === tool.id ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onToolChange(tool.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tool.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tool.description}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        <div className="border-t pt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={onReset}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Reset canvas to default square</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}