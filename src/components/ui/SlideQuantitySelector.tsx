'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlideQuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export default function SlideQuantitySelector({
  value,
  onChange,
  min = 3,
  max = 30,
}: SlideQuantitySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const increment = () => {
    if (value < max) onChange(value + 1)
  }

  const decrement = () => {
    if (value > min) onChange(value - 1)
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return
      e.preventDefault()
      if (e.deltaY < 0) increment()
      else decrement()
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  })

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="p-2 rounded-lg border border-border-subtle hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="relative flex items-center justify-center w-28 h-28 rounded-2xl bg-bg-surface border-2 border-primary/30 glow-blue">
          <div
            className="absolute inset-0 rounded-2xl opacity-20"
            style={{
              background: `conic-gradient(#0066FF ${percentage}%, transparent ${percentage}%)`,
            }}
          />
          <div className="text-center z-10">
            <span className="font-[family-name:var(--font-orbitron)] text-4xl font-bold text-primary">
              {value}
            </span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Layers className="w-3 h-3 text-text-muted" />
              <span className="text-text-muted text-xs">slides</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="p-2 rounded-lg border border-border-subtle hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

      {/* Slider track */}
      <div className="w-full max-w-[200px]">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border-subtle
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,102,255,0.5)] [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-text-muted mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  )
}
