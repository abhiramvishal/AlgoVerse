"use client";

import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";

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
  isPlaying, speed, onPlayPause, onStep, onReset, onSpeedChange,
}: ControlsProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-zinc-950/40 px-3 py-2 shadow backdrop-blur-md">
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onPlayPause}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.35)] hover:shadow-[0_0_16px_rgba(99,102,241,0.5)] transition-shadow"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onStep}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
        aria-label="Step forward"
      >
        <StepForward className="h-3.5 w-3.5" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.08, rotate: -30 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring" as const, damping: 18, stiffness: 380 }}
        onClick={onReset}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
        aria-label="Reset"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </motion.button>

      <div className="flex items-center gap-2 pl-2 border-l border-white/5">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider hidden sm:block">Speed</span>
        <div className="w-20">
          <Slider value={speed} min={0.25} max={4} step={0.25} onValueChange={onSpeedChange} />
        </div>
        <span className="text-[10px] font-mono text-indigo-400 w-8 text-right">{speed.toFixed(2)}x</span>
      </div>
    </div>
  );
}
