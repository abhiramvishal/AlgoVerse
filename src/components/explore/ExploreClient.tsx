"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart2 } from "lucide-react";

import { BottomBar } from "@/components/common/BottomBar";
import { CodePanel } from "@/components/code/CodePanel";
import { ComplexityBadge } from "@/components/code/ComplexityBadge";
import { VariableState } from "@/components/code/VariableState";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/explore/CategoryNav";
import { Controls } from "@/components/visualization/Controls";
import { InputPanel } from "@/components/visualization/InputPanel";
import { VisualizationCanvas } from "@/components/visualization/VisualizationCanvas";
import { useAnimationPlayer } from "@/hooks/useAnimationPlayer";
import { useVisualization } from "@/hooks/useVisualization";

interface ExploreClientProps {
  initialSlug?: string;
}

function parseInputFromQuery(raw: string | null): unknown | null {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { /* fall through */ }
  const parsed = raw.split(",").map((t) => Number(t.trim()));
  if (parsed.length && !parsed.some(Number.isNaN)) return parsed;
  return null;
}

const SPRING = { type: "spring" as const, damping: 26, stiffness: 340, mass: 0.7 };

export function ExploreClient({ initialSlug = "bubble-sort" }: ExploreClientProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [initialStep] = useState(() => Number(searchParams.get("step") ?? "0"));

  const { module: vm, steps, setSlug, setInput, input } = useVisualization();

  const parsedInputFromQuery = useMemo(
    () => parseInputFromQuery(searchParams.get("input")),
    [searchParams],
  );

  useEffect(() => { setSlug(initialSlug); }, [initialSlug, setSlug]);

  useEffect(() => {
    if (parsedInputFromQuery) { setInput(parsedInputFromQuery); return; }
    if (vm) setInput(vm.defaultInput);
  }, [vm, parsedInputFromQuery, setInput]);

  const {
    currentStep, currentStepIndex, totalSteps,
    isPlaying, speed, setIsPlaying, setSpeed,
    setCurrentStepIndex, stepForward, reset,
  } = useAnimationPlayer({
    steps,
    initialStep: Number.isFinite(initialStep) ? initialStep : 0,
  });

  useEffect(() => {
    if (!vm) return;
    const cat = vm.category[vm.category.length - 1] ?? "sorting";
    const p = new URLSearchParams();
    p.set("step", String(currentStepIndex));
    if (input !== null && input !== undefined) {
      if (Array.isArray(input) && (input as unknown[]).every((v) => typeof v === "number")) {
        p.set("input", (input as number[]).join(","));
      } else {
        p.set("input", JSON.stringify(input));
      }
    }
    router.replace(`/explore/${cat}/${vm.slug}?${p.toString()}`, { scroll: false });
  }, [currentStepIndex, input, vm, router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isPlaceholder = (currentStep?.visualState as any)?.state === "placeholder";

  /* ── Loading state ── */
  if (!vm || !currentStep) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-indigo-400" />
            </div>
            <p className="text-sm text-zinc-400">Loading visualization…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <Header />

      {/* Category + algorithm nav (collapsible row 2) */}
      <CategoryNav activeSlug={vm.slug} />

      {/* ── 3-column main layout ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ══ LEFT: Code panel ══ */}
        <div className="w-[290px] shrink-0 flex flex-col min-h-0 border-r border-white/5">
          {/* Algorithm title + complexity */}
          <div className="px-4 py-3 border-b border-white/5 shrink-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-sm font-semibold text-white leading-tight flex-1 min-w-0 truncate">
                {vm.title}
              </h1>
            </div>
            <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2">{vm.description}</p>
            <div className="pt-0.5">
              <ComplexityBadge
                timeComplexity={vm.timeComplexity}
                spaceComplexity={vm.spaceComplexity}
              />
            </div>
          </div>

          {/* Code panel — scrolls internally */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodePanel
              code={vm.pythonCode}
              highlightLines={isPlaceholder ? [] : currentStep.highlightLines}
            />
          </div>

          {/* Step counter at bottom */}
          {!isPlaceholder && (
            <div className="px-4 py-2 border-t border-white/5 shrink-0 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-600">
                Step {currentStep.stepNumber} / {totalSteps}
              </span>
              <span className="text-[10px] text-zinc-700 capitalize">{vm.difficulty}</span>
            </div>
          )}
        </div>

        {/* ══ CENTER: Visualization (dominant) ══ */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">

          {/* Compact controls + input bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 shrink-0 flex-wrap gap-y-2">
            {!isPlaceholder && (
              <>
                <div className="flex-1 min-w-0">
                  <InputPanel
                    defaultInput={vm.defaultInput}
                    input={input}
                    onApplyInput={(next: unknown) => {
                      setInput(next);
                      setCurrentStepIndex(0);
                      setIsPlaying(false);
                    }}
                  />
                </div>
                <div className="shrink-0">
                  <Controls
                    isPlaying={isPlaying}
                    speed={speed}
                    onPlayPause={() => setIsPlaying((p) => !p)}
                    onStep={stepForward}
                    onReset={reset}
                    onSpeedChange={setSpeed}
                  />
                </div>
              </>
            )}
            {isPlaceholder && (
              <div className="flex items-center gap-3 w-full">
                <h1 className="text-sm font-semibold text-white">{vm.title}</h1>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                  Visualization coming soon
                </span>
                <div className="ml-auto">
                  <ComplexityBadge
                    timeComplexity={vm.timeComplexity}
                    spaceComplexity={vm.spaceComplexity}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Visualization canvas — takes all remaining space */}
          <motion.div
            key={vm.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: SPRING }}
            className="flex-1 min-h-0 p-4 overflow-hidden"
          >
            <VisualizationCanvas visualState={currentStep.visualState} />
          </motion.div>
        </div>

        {/* ══ RIGHT: Variables panel ══ */}
        <div className="w-[210px] shrink-0 flex flex-col min-h-0 border-l border-white/5">
          <div className="px-4 py-3 border-b border-white/5 shrink-0">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Variables
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto p-3">
            {!isPlaceholder ? (
              <VariableState variables={currentStep.variables} />
            ) : (
              <p className="text-[11px] text-zinc-600 mt-2 px-1 leading-relaxed">
                Select an algorithm to see variable tracing.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar: step description */}
      <BottomBar
        currentStep={currentStep.stepNumber}
        totalSteps={totalSteps}
        description={currentStep.description}
        timeComplexity={vm.timeComplexity}
        spaceComplexity={vm.spaceComplexity}
      />
    </div>
  );
}
