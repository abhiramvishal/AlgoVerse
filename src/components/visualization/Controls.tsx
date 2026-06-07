"use client";

import { motion } from "framer-motion";
import { Activity, Pause, Play, RotateCcw, StepForward } from "lucide-react";

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
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Simulation Controls
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Play / Pause */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPlayPause}
          className="flex flex-1 min-w-[100px] h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] transition-shadow"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "Pause" : "Play"}
        </motion.button>

        {/* Step */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onStep}
          className="h-9 flex items-center justify-center gap-1.5 rounded-xl px-4 border border-white/5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition"
        >
          <StepForward className="h-4 w-4" />
          Step
        </motion.button>

        {/* Reset */}
        <motion.button
          whileHover={{ scale: 1.08, rotate: -30 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", damping: 18, stiffness: 360 }}
          onClick={onReset}
          aria-label="Reset animation"
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 hover:bg-zinc-900 text-zinc-400 hover:text-white transition"
        >
          <RotateCcw className="h-4 w-4" />
        </motion.button>
      </div>

      <div className="flex items-center gap-3 border-t border-white/5 pt-3">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold w-12">
          Speed
        </span>
        <Slider
          value={speed}
          min={0.25}
          max={4}
          step={0.25}
          onValueChange={onSpeedChange}
          className="flex-1"
        />
        <span className="w-12 text-right text-xs font-mono font-bold text-indigo-400 glow-text">
          {speed.toFixed(2)}x
        </span>
      </div>
    </div>
  );
}
