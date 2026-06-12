"use client";

import { useCallback, useMemo, useTransition } from "react";
import { create } from "zustand";

import { getVisualizationBySlug } from "@/lib/visualization-registry";
import type { AnimationStep, VisualizationModule } from "@/types/visualization";

/* ── Step cache — keyed by "slug:inputJSON", capped at 30 entries ── */
const stepsCache = new Map<string, AnimationStep[]>();

function getCachedSteps(mod: VisualizationModule, input: unknown): AnimationStep[] {
  const key = `${mod.slug}:${JSON.stringify(input)}`;
  if (stepsCache.has(key)) return stepsCache.get(key)!;

  let result: AnimationStep[];
  try {
    result = mod.generateSteps(input);
  } catch {
    // Bad input (e.g. malformed ?input= in a shared URL) — fall back to defaults
    result = mod.generateSteps(mod.defaultInput);
  }
  stepsCache.set(key, result);

  // Evict oldest entry if over cap
  if (stepsCache.size > 30) {
    const oldest = stepsCache.keys().next().value;
    if (oldest) stepsCache.delete(oldest);
  }

  return result;
}

interface VisualizationState {
  slug: string;
  input: unknown;
  setSlug: (slug: string) => void;
  setInput: (input: unknown) => void;
}

const useVisualizationStore = create<VisualizationState>((set) => ({
  slug:     "bubble-sort",
  input:    null,
  // Reset input atomically on slug change — otherwise the new module's
  // generateSteps runs once with the PREVIOUS algorithm's input shape,
  // which crashes (or infinite-loops) modules expecting a different type.
  setSlug:  (slug)  => set((s) => (s.slug === slug ? s : { slug, input: null })),
  setInput: (input) => set({ input }),
}));

export function useVisualization() {
  const { slug, input, setSlug, setInput } = useVisualizationStore();
  const [isPending, startTransition] = useTransition();

  const visualizationModule = useMemo(
    () => getVisualizationBySlug(slug),
    [slug],
  );

  const effectiveInput = useMemo(
    () => (input == null ? visualizationModule?.defaultInput : input),
    [input, visualizationModule?.defaultInput],
  );

  const steps = useMemo<AnimationStep[]>(() => {
    if (!visualizationModule) return [];
    return getCachedSteps(visualizationModule, effectiveInput);
  }, [visualizationModule, effectiveInput]);

  /* Wrap setSlug in startTransition so React keeps the current frame live
     while computing the new algorithm's steps in the background              */
  const transitionSetSlug = useCallback(
    (newSlug: string) => startTransition(() => setSlug(newSlug)),
    [setSlug, startTransition],
  );

  return {
    module: visualizationModule,
    steps,
    slug,
    input: effectiveInput,
    setSlug: transitionSetSlug,
    setInput,
    isPending,
  };
}
