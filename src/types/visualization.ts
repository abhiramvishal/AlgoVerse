export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface CodeStep {
  stepNumber: number;
  highlightLines: number[];
}

export interface AnimationStep {
  stepNumber: number;
  description: string;
  highlightLines: number[];
  visualState: Record<string, unknown>;
  variables: Record<string, unknown>;
}

export interface VisualizationModule<TInput = unknown> {
  id: string;
  slug: string;
  title: string;
  category: string[];
  difficulty: Difficulty;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  relatedTopics: string[];
  pythonCode: string;
  codeSteps: CodeStep[];
  defaultInput: TInput;
  generateSteps(input: TInput): AnimationStep[];
}

export interface VisualizationTaxonomyNode {
  id: string;
  label: string;
  children?: VisualizationTaxonomyNode[];
}
