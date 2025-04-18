import React, { createContext, useContext, useState } from 'react';
import { 
  AppState, 
  CommentInput, 
  CommentEvaluation, 
  PromptHistoryEntry,
  LLMSettings,
  LLMModel 
} from '../models/types';

// Default app state
const initialState: AppState = {
  currentPrompt: '',
  promptHistory: [],
  comments: [],
  evaluations: [],
  selectedCommentIndex: 0,
  hideLLMScores: false,
  llmSettings: {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000
  }
};

// Create context
const AppContext = createContext<{
  state: AppState;
  setCurrentPrompt: (prompt: string) => void;
  addPromptToHistory: (entry: PromptHistoryEntry) => void;
  setComments: (comments: CommentInput[]) => void;
  setEvaluations: (evaluations: CommentEvaluation[]) => void;
  setSelectedCommentIndex: (index: number) => void;
  toggleHideLLMScores: () => void;
  calculateAlignmentScores: () => void;
  updateLLMSettings: (settings: Partial<LLMSettings>) => void;
}>({
  state: initialState,
  setCurrentPrompt: () => {},
  addPromptToHistory: () => {},
  setComments: () => {},
  setEvaluations: () => {},
  setSelectedCommentIndex: () => {},
  toggleHideLLMScores: () => {},
  calculateAlignmentScores: () => {},
  updateLLMSettings: () => {},
});

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  // Update prompt
  const setCurrentPrompt = React.useCallback((prompt: string) => {
    setState((prevState) => ({
      ...prevState,
      currentPrompt: prompt,
    }));
  }, []);

  // Add prompt to history
  const addPromptToHistory = React.useCallback((entry: PromptHistoryEntry) => {
    setState((prevState) => ({
      ...prevState,
      promptHistory: [entry, ...prevState.promptHistory],
    }));
  }, []);

  // Update comments
  const setComments = React.useCallback((comments: CommentInput[]) => {
    setState((prevState) => ({
      ...prevState,
      comments,
      // Create empty evaluations for each comment
      evaluations: comments.map((comment) => ({
        ...comment,
        llm_scores: {
          attractiveness: 0,
          efficiency: 0,
          perspicuity: 0,
          dependability: 0,
          stimulation: 0,
          novelty: 0,
        },
        llm_justification: {
          attractiveness: '',
          efficiency: '',
          perspicuity: '',
          dependability: '',
          stimulation: '',
          novelty: '',
        },
        human_scores: {
          attractiveness: 0,
          efficiency: 0,
          perspicuity: 0,
          dependability: 0,
          stimulation: 0,
          novelty: 0,
        },
        overall_alignment_score: 0,
        dimension_alignments: {
          attractiveness_alignment: 0,
          efficiency_alignment: 0,
          perspicuity_alignment: 0,
          dependability_alignment: 0,
          stimulation_alignment: 0,
          novelty_alignment: 0,
        },
      })),
    }));
  }, []);

  // Update evaluations
  const setEvaluations = React.useCallback((evaluations: CommentEvaluation[]) => {
    setState((prevState) => ({
      ...prevState,
      evaluations,
    }));
  }, []);

  // Change selected comment index
  const setSelectedCommentIndex = React.useCallback((index: number) => {
    setState((prevState) => ({
      ...prevState,
      selectedCommentIndex: index,
    }));
  }, []);

  // Toggle hide LLM scores
  const toggleHideLLMScores = React.useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      hideLLMScores: !prevState.hideLLMScores,
    }));
  }, []);

  // Calculate alignment scores for current evaluations
  const calculateAlignmentScores = React.useCallback(() => {
    if (state.evaluations.length === 0) return;

    const updatedEvaluations = state.evaluations.map((evaluation) => {
      // Calculate alignment for each dimension
      const dimensionAlignments = {
        attractiveness_alignment: calculateSingleAlignment(
          evaluation.llm_scores.attractiveness,
          evaluation.human_scores.attractiveness
        ),
        efficiency_alignment: calculateSingleAlignment(
          evaluation.llm_scores.efficiency,
          evaluation.human_scores.efficiency
        ),
        perspicuity_alignment: calculateSingleAlignment(
          evaluation.llm_scores.perspicuity,
          evaluation.human_scores.perspicuity
        ),
        dependability_alignment: calculateSingleAlignment(
          evaluation.llm_scores.dependability,
          evaluation.human_scores.dependability
        ),
        stimulation_alignment: calculateSingleAlignment(
          evaluation.llm_scores.stimulation,
          evaluation.human_scores.stimulation
        ),
        novelty_alignment: calculateSingleAlignment(
          evaluation.llm_scores.novelty,
          evaluation.human_scores.novelty
        ),
      };

      // Calculate overall alignment score (average of all dimensions)
      const overallAlignmentScore = (
        dimensionAlignments.attractiveness_alignment +
        dimensionAlignments.efficiency_alignment +
        dimensionAlignments.perspicuity_alignment +
        dimensionAlignments.dependability_alignment +
        dimensionAlignments.stimulation_alignment +
        dimensionAlignments.novelty_alignment
      ) / 6;

      return {
        ...evaluation,
        dimension_alignments: dimensionAlignments,
        overall_alignment_score: overallAlignmentScore,
      };
    });

    setState((prevState) => ({
      ...prevState,
      evaluations: updatedEvaluations,
    }));
  }, [state.evaluations]);

  // Helper function to calculate alignment between two scores
  // Returns value between 0 (no alignment) and 1 (perfect alignment)
  const calculateSingleAlignment = (llmScore: number, humanScore: number): number => {
    // Maximum possible difference is 6 (from -3 to +3)
    const difference = Math.abs(llmScore - humanScore);
    // Convert to alignment score (0-1 range)
    return 1 - (difference / 6);
  };

  // Update LLM settings
  const updateLLMSettings = React.useCallback((settings: Partial<LLMSettings>) => {
    setState((prevState) => ({
      ...prevState,
      llmSettings: {
        ...prevState.llmSettings,
        ...settings
      }
    }));

    // Save settings to localStorage for persistence
    const updatedSettings = {
      ...state.llmSettings,
      ...settings
    };
    localStorage.setItem('llmSettings', JSON.stringify(updatedSettings));
  }, [state.llmSettings]);

  // Load LLM settings from localStorage on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('llmSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        updateLLMSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse saved LLM settings:', error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        setCurrentPrompt,
        addPromptToHistory,
        setComments,
        setEvaluations,
        setSelectedCommentIndex,
        toggleHideLLMScores,
        calculateAlignmentScores,
        updateLLMSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext);
