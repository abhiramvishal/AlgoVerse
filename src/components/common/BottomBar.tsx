interface BottomBarProps {
  currentStep: number;
  totalSteps: number;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export function BottomBar({
  currentStep,
  totalSteps,
  description,
  timeComplexity,
  spaceComplexity,
}: BottomBarProps) {
  return (
    <div className="grid min-h-12 grid-cols-1 items-center gap-2 border-t border-zinc-800 bg-zinc-950/90 px-4 py-2 text-sm md:grid-cols-[180px_1fr_180px]">
      <div className="font-semibold text-zinc-200">
        Step {Math.max(currentStep, 0)} of {Math.max(totalSteps, 0)}
      </div>
      <div className="truncate text-zinc-300">{description}</div>
      <div className="text-right text-xs text-zinc-400">
        <span className="mr-3">T: {timeComplexity}</span>
        <span>S: {spaceComplexity}</span>
      </div>
    </div>
  );
}
