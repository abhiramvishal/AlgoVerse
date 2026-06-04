"use client";

import { useMemo } from "react";
import { create } from "zustand";

import { getVisualizationBySlug } from "@/lib/visualization-registry";
import type { AnimationStep, VisualizationModule } from "@/types/visualization";

interface VisualizationState {
  slug: string;
  input: unknown;
  setSlug: (slug: string) => void;
  setInput: (input: unknown) => void;
}

const useVisualizationStore = create<VisualizationState>((set) => ({
  slug: "bubble-sort",
  input: null,
  setSlug: (slug) => set({ slug }),
  setInput: (input) => set({ input }),
}));

export function useVisualization() {
  const { slug, input, setSlug, setInput } = useVisualizationStore();

  const visualizationModule = useMemo<VisualizationModule | undefined>(
    () => getVisualizationBySlug(slug),
    [slug],
  );

  const effectiveInput = useMemo(
    () => (input == null ? visualizationModule?.defaultInput : input),
    [input, visualizationModule?.defaultInput],
  );

  const steps = useMemo<AnimationStep[]>(
    () => (visualizationModule ? visualizationModule.generateSteps(effectiveInput) : []),
    [visualizationModule, effectiveInput],
  );

  return {
    module: visualizationModule,
    steps,
    slug,
    input: effectiveInput,
    setSlug,
    setInput,
  };
}
