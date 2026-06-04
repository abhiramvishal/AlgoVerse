"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  clampStepIndex,
  getStepIntervalMs,
  nextStepIndex,
  previousStepIndex,
} from "@/lib/animation-engine";
import type { AnimationStep } from "@/types/visualization";

interface AnimationPlayerOptions {
  steps: AnimationStep[];
  initialStep?: number;
}

export function useAnimationPlayer({
  steps,
  initialStep = 0,
}: AnimationPlayerOptions) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const totalSteps = steps.length;
  const safeStepIndex = clampStepIndex(currentStepIndex, totalSteps);

  const currentStep = useMemo(
    () => steps[safeStepIndex] ?? null,
    [safeStepIndex, steps],
  );

  const stepForward = useCallback(() => {
    setCurrentStepIndex((prev) => nextStepIndex(prev, totalSteps));
  }, [totalSteps]);

  const stepBackward = useCallback(() => {
    setCurrentStepIndex((prev) => previousStepIndex(prev, totalSteps));
  }, [totalSteps]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  useEffect(() => {
    if (!isPlaying || totalSteps <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentStepIndex((previousIndex) => {
        if (previousIndex >= totalSteps - 1) {
          setIsPlaying(false);
          return previousIndex;
        }
        return previousIndex + 1;
      });
    }, getStepIntervalMs(speed));

    return () => window.clearInterval(timer);
  }, [isPlaying, speed, totalSteps]);

  return {
    currentStep,
    currentStepIndex: safeStepIndex,
    totalSteps,
    isPlaying,
    speed,
    setIsPlaying,
    setSpeed,
    setCurrentStepIndex,
    stepForward,
    stepBackward,
    reset,
  };
}
