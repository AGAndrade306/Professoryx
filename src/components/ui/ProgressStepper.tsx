'use client'

import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  key: string
  label: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: string
  completedSteps: string[]
  errorStep?: string | null
}

export default function ProgressStepper({ steps, currentStep, completedSteps, errorStep }: ProgressStepperProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.key)
        const isCurrent = step.key === currentStep
        const isError = step.key === errorStep

        return (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 transition-all duration-300',
                isCompleted && 'bg-secondary-green/20 border-secondary-green text-secondary-green',
                isCurrent && !isError && 'border-primary bg-primary/10 text-primary',
                isError && 'border-red-500 bg-red-500/10 text-red-400',
                !isCompleted && !isCurrent && !isError && 'border-border-subtle text-text-muted'
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : isCurrent && !isError ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                isCompleted && 'text-secondary-green',
                isCurrent && !isError && 'text-primary',
                isError && 'text-red-400',
                !isCompleted && !isCurrent && !isError && 'text-text-muted'
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
