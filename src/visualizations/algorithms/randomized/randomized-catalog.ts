import { createPlaceholderModule } from "@/visualizations/placeholder";

export const randomizedQuicksortModule = createPlaceholderModule(
  "randomized-quicksort", "randomized-quicksort", "Randomized QuickSort",
  ["algorithms", "randomized"], "intermediate",
);

export const reservoirSamplingModule = createPlaceholderModule(
  "reservoir-sampling", "reservoir-sampling", "Reservoir Sampling",
  ["algorithms", "randomized"], "intermediate",
);

export const monteCarloPiModule = createPlaceholderModule(
  "monte-carlo-pi", "monte-carlo-pi", "Monte Carlo π",
  ["algorithms", "randomized"], "beginner",
);

export const lasVegasModule = createPlaceholderModule(
  "las-vegas", "las-vegas", "Las Vegas Algorithms",
  ["algorithms", "randomized"], "intermediate",
);
