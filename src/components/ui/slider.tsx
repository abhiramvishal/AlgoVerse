import * as React from "react";

import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  onValueChange: (value: number) => void;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  className,
  onValueChange,
}: SliderProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onValueChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-blue-500"
      />
    </div>
  );
}
