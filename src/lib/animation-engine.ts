import type { AnimationStep } from "@/types/visualization";

const BASE_STEP_MS = 900;

export function clampStepIndex(index: number, totalSteps: number) {
  if (totalSteps <= 0) return 0;
  return Math.min(Math.max(index, 0), totalSteps - 1);
}

export function nextStepIndex(currentStep: number, totalSteps: number) {
  if (totalSteps === 0) return 0;
  return clampStepIndex(currentStep + 1, totalSteps);
}

export function previousStepIndex(currentStep: number, totalSteps: number) {
  if (totalSteps === 0) return 0;
  return clampStepIndex(currentStep - 1, totalSteps);
}

export function getStepIntervalMs(speed: number) {
  const normalized = Math.min(Math.max(speed, 0.25), 4);
  return BASE_STEP_MS / normalized;
}

export function getCurrentStep(
  steps: AnimationStep[],
  currentStepIndex: number,
): AnimationStep | null {
  if (!steps.length) return null;
  return steps[clampStepIndex(currentStepIndex, steps.length)];
}
