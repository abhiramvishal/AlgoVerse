"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BottomBar } from "@/components/common/BottomBar";
import { CodePanel } from "@/components/code/CodePanel";
import { ComplexityBadge } from "@/components/code/ComplexityBadge";
import { VariableState } from "@/components/code/VariableState";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Controls } from "@/components/visualization/Controls";
import { InputPanel } from "@/components/visualization/InputPanel";
import { VisualizationCanvas } from "@/components/visualization/VisualizationCanvas";
import { useAnimationPlayer } from "@/hooks/useAnimationPlayer";
import { useVisualization } from "@/hooks/useVisualization";

interface ExploreClientProps {
  initialSlug?: string;
}

function parseInputFromQuery(raw: string | null): number[] | null {
  if (!raw) return null;
  const parsed = raw
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => Number(token));

  if (!parsed.length || parsed.some((value) => Number.isNaN(value))) {
    return null;
  }
  return parsed;
}

export function ExploreClient({ initialSlug = "bubble-sort" }: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialStep] = useState(() => Number(searchParams.get("step") ?? "0"));

  const { module: visualizationModule, steps, setSlug, setInput, input } =
    useVisualization();
  const parsedInputFromQuery = useMemo(
    () => parseInputFromQuery(searchParams.get("input")),
    [searchParams],
  );

  useEffect(() => {
    setSlug(initialSlug);
  }, [initialSlug, setSlug]);

  useEffect(() => {
    if (parsedInputFromQuery) {
      setInput(parsedInputFromQuery);
      return;
    }
    if (visualizationModule) {
      setInput(visualizationModule.defaultInput);
    }
  }, [visualizationModule, parsedInputFromQuery, setInput]);

  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    isPlaying,
    speed,
    setIsPlaying,
    setSpeed,
    setCurrentStepIndex,
    stepForward,
    reset,
  } = useAnimationPlayer({
    steps,
    initialStep: Number.isFinite(initialStep) ? initialStep : 0,
  });

  useEffect(() => {
    if (!visualizationModule) return;
    const category =
      visualizationModule.category[visualizationModule.category.length - 1] ??
      "sorting";
    const nextParams = new URLSearchParams();
    nextParams.set("step", String(currentStepIndex));
    if (Array.isArray(input)) {
      nextParams.set("input", input.join(","));
    }
    router.replace(
      `/explore/${category}/${visualizationModule.slug}?${nextParams.toString()}`,
      {
        scroll: false,
      },
    );
  }, [currentStepIndex, input, visualizationModule, router]);

  if (!visualizationModule || !currentStep) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400">
        Loading visualization...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="grid min-h-0 flex-1 grid-cols-[288px_1fr]">
        <Sidebar activeSlug={visualizationModule.slug} />
        <div className="grid min-h-0 grid-cols-[1.2fr_0.9fr]">
          <div className="min-h-0 space-y-3 border-r border-zinc-800 p-3">
            <div>
              <h1 className="text-lg font-semibold">{visualizationModule.title}</h1>
              <p className="text-sm text-zinc-400">{visualizationModule.description}</p>
            </div>
            <InputPanel
              input={input}
              onApplyInput={(nextInput) => {
                setInput(nextInput);
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
            />
            <Controls
              isPlaying={isPlaying}
              speed={speed}
              onPlayPause={() => setIsPlaying((playing) => !playing)}
              onStep={stepForward}
              onReset={reset}
              onSpeedChange={setSpeed}
            />
            <div className="h-[calc(100vh-360px)] min-h-64">
              <VisualizationCanvas visualState={currentStep.visualState} />
            </div>
          </div>
          <div className="min-h-0 p-3">
            <div className="grid h-full grid-rows-[minmax(0,1fr)_auto_auto] gap-3">
              <CodePanel
                code={visualizationModule.pythonCode}
                highlightLines={currentStep.highlightLines}
              />
              <VariableState variables={currentStep.variables} />
              <ComplexityBadge
                timeComplexity={visualizationModule.timeComplexity}
                spaceComplexity={visualizationModule.spaceComplexity}
              />
            </div>
          </div>
        </div>
      </div>
      <BottomBar
        currentStep={currentStep.stepNumber}
        totalSteps={totalSteps}
        description={currentStep.description}
        timeComplexity={visualizationModule.timeComplexity}
        spaceComplexity={visualizationModule.spaceComplexity}
      />
    </div>
  );
}
