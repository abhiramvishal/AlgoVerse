"use client";

import { Pause, Play, RotateCcw, StepForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function Controls({
  isPlaying,
  speed,
  onPlayPause,
  onStep,
  onReset,
  onSpeedChange,
}: ControlsProps) {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={onPlayPause}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button size="sm" variant="secondary" onClick={onStep}>
          <StepForward className="h-4 w-4" />
          Step
        </Button>
        <Button size="sm" variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-xs text-zinc-400">Speed</span>
        <Slider
          value={speed}
          min={0.25}
          max={4}
          step={0.25}
          onValueChange={onSpeedChange}
          className="flex-1"
        />
        <span className="w-12 text-right text-xs font-semibold">{speed.toFixed(2)}x</span>
      </div>
    </div>
  );
}
