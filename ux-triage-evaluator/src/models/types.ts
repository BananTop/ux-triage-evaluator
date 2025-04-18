// Define the UX dimensions that will be scored
export type UXDimension = 'attractiveness' | 'efficiency' | 'perspicuity' | 'dependability' | 'stimulation' | 'novelty';

// Score range from -3 to 3
export type Score = -3 | -2 | -1 | 0 | 1 | 2 | 3;

// Original input comment format
export interface CommentInput {
  name: string;
  date: string;
  text: string;
  stars: number;
}

// Scores for all dimensions
export interface DimensionScores {
  attractiveness: Score;
  efficiency: Score;
  perspicuity: Score;
  dependability: Score;
  stimulation: Score;
  novelty: Score;
}

// LLM justifications for each dimension
export interface LLMJustification {
  attractiveness: string;
  efficiency: string;
  perspicuity: string;
  dependability: string;
  stimulation: string;
  novelty: string;
}

// Alignment scores between human and LLM
export interface DimensionAlignment {
  attractiveness_alignment: number;
  efficiency_alignment: number;
  perspicuity_alignment: number;
  dependability_alignment: number;
  stimulation_alignment: number;
  novelty_alignment: number;
}

// Full comment evaluation
export interface CommentEvaluation extends CommentInput {
  llm_scores: DimensionScores;
  llm_justification: LLMJustification;
  human_scores: DimensionScores;
  overall_alignment_score: number;
  dimension_alignments: DimensionAlignment;
}

// Prompt history entry
export interface PromptHistoryEntry {
  id: string;
  prompt: string;
  timestamp: string;
  overall_alignment_score: number;
  dimension_alignments: DimensionAlignment;
}

// LLM Model options
export type LLMModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-2' | 'llama-2' | 'custom';

// LLM Settings
export interface LLMSettings {
  apiKey: string;
  model: LLMModel;
  customModelName?: string; // Used when model is 'custom'
  temperature?: number;
  maxTokens?: number;
}

// App state
export interface AppState {
  currentPrompt: string;
  promptHistory: PromptHistoryEntry[];
  comments: CommentInput[];
  evaluations: CommentEvaluation[];
  selectedCommentIndex: number;
  hideLLMScores: boolean;
  llmSettings: LLMSettings;
}
