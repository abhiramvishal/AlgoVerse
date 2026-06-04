import type { VisualizationModule } from "@/types/visualization";

export function createPlaceholderModule(
  id: string,
  slug: string,
  title: string,
  category: string[],
  difficulty: "beginner" | "intermediate" | "advanced" = "beginner",
): VisualizationModule {
  return {
    id,
    slug,
    title,
    category,
    difficulty,
    timeComplexity: "-",
    spaceComplexity: "-",
    description: "Coming in upcoming milestone.",
    relatedTopics: [],
    pythonCode: "def todo():\n    pass",
    codeSteps: [],
    defaultInput: null,
    generateSteps: () => [
      {
        stepNumber: 1,
        description: "Visualization module placeholder.",
        highlightLines: [1, 2],
        visualState: { state: "placeholder" },
        variables: {},
      },
    ],
  };
}
