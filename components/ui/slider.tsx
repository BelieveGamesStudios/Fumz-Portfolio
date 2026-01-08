'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={
          'bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'
        }
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={
            'bg-gradient-to-r from-slate-400 via-slate-200 to-slate-100 absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full z-10'
          }
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -4px 10px rgba(0,0,0,0.08)' }}
        />
        {/* glossy overlay to simulate light bouncing */}
        <div className="absolute inset-0 pointer-events-none rounded-full z-20 bg-gradient-to-r from-white/30 via-white/10 to-white/6 opacity-80 mix-blend-screen" />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="z-30 border-slate-400 ring-ring/50 block size-4 shrink-0 rounded-full border bg-gradient-to-br from-slate-100 to-slate-200 shadow-md transition-[color,box-shadow] hover:shadow-lg focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
