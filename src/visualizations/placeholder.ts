import type { VisualizationModule } from "@/types/visualization";

interface PlaceholderOptions {
  pythonCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  description?: string;
}

export function createPlaceholderModule(
  id: string,
  slug: string,
  title: string,
  category: string[],
  difficulty: "beginner" | "intermediate" | "advanced" = "beginner",
  options: PlaceholderOptions = {},
): VisualizationModule {
  return {
    id,
    slug,
    title,
    category,
    difficulty,
    timeComplexity: options.timeComplexity ?? "-",
    spaceComplexity: options.spaceComplexity ?? "-",
    description: options.description ?? "Coming in upcoming milestone.",
    relatedTopics: [],
    pythonCode: options.pythonCode ?? "# Visualization coming soon\ndef todo():\n    pass",
    codeSteps: [],
    defaultInput: null,
    generateSteps: () => [
      {
        stepNumber: 1,
        description: "Visualization coming soon. Code shown for reference.",
        highlightLines: [],
        visualState: { state: "placeholder" },
        variables: {},
      },
    ],
  };
}
