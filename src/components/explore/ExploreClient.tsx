"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart2, Braces, Code2 } from "lucide-react";

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
  if (!parsed.length || parsed.some((v) => Number.isNaN(v))) return null;
  return parsed;
}

/* ── right-panel tabs ── */
type RightTab = "code" | "variables";

const RIGHT_TABS: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  { id: "code",      label: "Code",      icon: <Code2     className="h-3.5 w-3.5" /> },
  { id: "variables", label: "Variables", icon: <Braces className="h-3.5 w-3.5" /> },
];

/* ── page-level tabs ── */
type MainTab = "visualizer" | "code";

const MAIN_TABS: { id: MainTab; label: string; icon: React.ReactNode }[] = [
  { id: "visualizer", label: "Visualizer", icon: <BarChart2 className="h-3.5 w-3.5" /> },
  { id: "code",       label: "Code",       icon: <Code2    className="h-3.5 w-3.5" /> },
];

/* ── shared tab indicator spring ── */
const TAB_SPRING = { type: "spring", damping: 26, stiffness: 380, mass: 0.6 } as const;

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

  useEffect(() => { setSlug(initialSlug); }, [initialSlug, setSlug]);

  useEffect(() => {
    if (parsedInputFromQuery) { setInput(parsedInputFromQuery); return; }
    if (visualizationModule) setInput(visualizationModule.defaultInput);
  }, [visualizationModule, parsedInputFromQuery, setInput]);

  const {
    currentStep, currentStepIndex, totalSteps,
    isPlaying, speed, setIsPlaying, setSpeed,
    setCurrentStepIndex, stepForward, reset,
  } = useAnimationPlayer({
    steps,
    initialStep: Number.isFinite(initialStep) ? initialStep : 0,
  });

  useEffect(() => {
    if (!visualizationModule) return;
    const category =
      visualizationModule.category[visualizationModule.category.length - 1] ?? "sorting";
    const params = new URLSearchParams();
    params.set("step", String(currentStepIndex));
    if (Array.isArray(input)) params.set("input", input.join(","));
    router.replace(`/explore/${category}/${visualizationModule.slug}?${params.toString()}`, { scroll: false });
  }, [currentStepIndex, input, visualizationModule, router]);

  const [rightTab, setRightTab] = useState<RightTab>("code");
  const [mainTab, setMainTab] = useState<MainTab>("visualizer");

  if (!visualizationModule || !currentStep) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400">
        Loading visualization...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <Header />

      {/* Mobile tab bar — hidden on lg+ */}
      <div className="lg:hidden flex items-center border-b border-white/5 bg-zinc-950/60 backdrop-blur-md px-4 relative">
        {MAIN_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMainTab(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors ${
              mainTab === tab.id ? "text-indigo-300" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.icon}
            {tab.label}
            {mainTab === tab.id && (
              <motion.div
                layoutId="mobile-tab-indicator"
                transition={TAB_SPRING}
                className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 rounded-full"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[288px_1fr] overflow-hidden">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar activeSlug={visualizationModule.slug} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {/* On lg always show both panels via grid; on mobile show active tab */}
          <div key="content" className="min-h-0 flex-1 overflow-hidden grid lg:grid-cols-[1.2fr_0.9fr]">

            {/* Left / Visualizer panel */}
            <motion.div
              key={`vis-${mainTab}`}
              className={`min-h-0 space-y-3 border-r border-zinc-800 p-3 ${
                mainTab !== "visualizer" ? "hidden lg:flex lg:flex-col" : "flex flex-col"
              }`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, transition: { type: "spring", damping: 26, stiffness: 320 } }}
            >
              {/* Algorithm title */}
              <div>
                <h1 className="text-lg font-semibold text-white">{visualizationModule.title}</h1>
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
                onPlayPause={() => setIsPlaying((p) => !p)}
                onStep={stepForward}
                onReset={reset}
                onSpeedChange={setSpeed}
              />
              <div className="flex-1 min-h-64">
                <VisualizationCanvas visualState={currentStep.visualState} />
              </div>
            </motion.div>

            {/* Right / Code panel */}
            <motion.div
              className={`min-h-0 p-3 flex flex-col gap-3 ${
                mainTab !== "code" ? "hidden lg:flex" : "flex"
              }`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0, transition: { type: "spring", damping: 26, stiffness: 320 } }}
            >
              {/* Right-panel tabs */}
              <div className="flex items-center gap-1 border-b border-white/5 pb-2 relative">
                {RIGHT_TABS.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRightTab(tab.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      rightTab === tab.id
                        ? "text-indigo-300"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {rightTab === tab.id && (
                      <motion.div
                        layoutId="right-tab-bg"
                        transition={TAB_SPRING}
                        className="absolute inset-0 rounded-lg bg-indigo-600/15 border border-indigo-500/20"
                        style={{ zIndex: -1 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 min-h-0 grid grid-rows-[minmax(0,1fr)_auto] gap-3">
                <AnimatePresence mode="wait" initial={false}>
                  {rightTab === "code" ? (
                    <motion.div
                      key="code-panel"
                      className="min-h-0 flex flex-col gap-3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0, transition: { type: "spring", damping: 22, stiffness: 300 } }}
                      exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                    >
                      <div className="flex-1 min-h-0">
                        <CodePanel
                          code={visualizationModule.pythonCode}
                          highlightLines={currentStep.highlightLines}
                        />
                      </div>
                      <VariableState variables={currentStep.variables} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="variables-panel"
                      className="min-h-0 overflow-auto"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0, transition: { type: "spring", damping: 22, stiffness: 300 } }}
                      exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                    >
                      <VariableState variables={currentStep.variables} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <ComplexityBadge
                  timeComplexity={visualizationModule.timeComplexity}
                  spaceComplexity={visualizationModule.spaceComplexity}
                />
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
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
