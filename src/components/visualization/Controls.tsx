"use client";

import { Pause, Play, RotateCcw, StepForward, Activity } from "lucide-react";

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
    <div className="space-y-4 rounded-2xl border border-white/5 bg-zinc-950/40 p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-indigo-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Simulation Controls</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button 
          size="sm" 
          onClick={onPlayPause}
          className="flex-1 min-w-[100px] h-9 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={onStep}
          className="h-9 rounded-xl px-4 border border-white/5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 active:scale-95 transition-all"
        >
          <StepForward className="h-4 w-4" />
          Step
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onReset}
          className="h-9 w-9 rounded-xl p-0 border-white/10 hover:bg-zinc-900 text-zinc-400 hover:text-white active:scale-95 transition-all"
          aria-label="Reset animation"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 border-t border-white/5 pt-3">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold w-12">Speed</span>
        <Slider
          value={speed}
          min={0.25}
          max={4}
          step={0.25}
          onValueChange={onSpeedChange}
          className="flex-1"
        />
        <span className="w-12 text-right text-xs font-mono font-bold text-indigo-400 glow-text">{speed.toFixed(2)}x</span>
      </div>
    </div>
  );
}
