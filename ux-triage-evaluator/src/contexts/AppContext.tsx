import React, { createContext, useContext, useState } from 'react';
import { 
  AppState, 
  CommentInput, 
  CommentEvaluation, 
  PromptHistoryEntry,
  LLMSettings,
  LLMModel,
  HumanScoreSnapshot
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
  },
  humanScoreHistory: [] // Initialize empty human score history
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
  calculateAlignmentScores: (evaluationsToUse?: CommentEvaluation[]) => void;
  updateLLMSettings: (settings: Partial<LLMSettings>) => void;
  saveHumanScores: () => string; // Save current human scores and return the snapshot ID
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
  saveHumanScores: () => '',
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

  // Add prompt to history with controlled duplication
  const addPromptToHistory = React.useCallback((entry: PromptHistoryEntry) => {
    setState((prevState) => {
      // Get current timestamp
      const now = new Date();
      const entryTime = entry.timestamp ? new Date(entry.timestamp) : now;
      
      // Look for very recent entries with the same prompt text (within 5 seconds)
      // This prevents accidental duplicates from multiple component updates
      const recentDuplicates = prevState.promptHistory.filter(histEntry => {
        // Check if prompt texts match
        const promptsMatch = histEntry.prompt.trim() === entry.prompt.trim();
        if (!promptsMatch) return false;
        
        // Check if timestamps are within 5 seconds
        const entryDate = new Date(histEntry.timestamp);
        const timeDiffMs = Math.abs(entryDate.getTime() - entryTime.getTime());
        return timeDiffMs < 5000; // 5 seconds threshold
      });
      
      // If we have a very recent duplicate and this is not explicitly a human score update
      // (indicated by humanScoreSnapshotId being present), don't add a new entry
      if (recentDuplicates.length > 0 && !entry.humanScoreSnapshotId) {
        console.log('Preventing duplicate prompt entry (created within 5 seconds)');
        return prevState;
      }
      
      // If this entry has a humanScoreSnapshotId, it's updating an existing prompt with human scores
      if (entry.humanScoreSnapshotId) {
        // Find the existing entry to update
        const indexToUpdate = prevState.promptHistory.findIndex(e => e.id === entry.id);
        
        if (indexToUpdate !== -1) {
          console.log('Updating existing history entry with human scores');
          const updatedHistory = [...prevState.promptHistory];
          updatedHistory[indexToUpdate] = {
            ...updatedHistory[indexToUpdate],
            humanScoreSnapshotId: entry.humanScoreSnapshotId,
            runId: entry.runId || updatedHistory[indexToUpdate].runId
          };
          return {
            ...prevState,
            promptHistory: updatedHistory
          };
        }
      }
      
      // Create a new history entry
      const historyEntry = {
        ...entry,
        id: entry.id || Date.now().toString(),
        timestamp: entry.timestamp || now.toISOString(),
        runId: entry.runId || `run-${Date.now()}`
      };
      
      console.log('Adding new prompt history entry:', historyEntry);
      return {
        ...prevState,
        promptHistory: [historyEntry, ...prevState.promptHistory]
      };
    });
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
  // Pass current evaluations as parameter to avoid stale closure issues
  const calculateAlignmentScores = React.useCallback((evaluationsToUse?: CommentEvaluation[]) => {
    // Use passed evaluations or fall back to state.evaluations
    const currentEvaluations = evaluationsToUse || state.evaluations;
    
    if (currentEvaluations.length === 0) return;
    
    console.log('Calculating alignment scores for evaluations:', currentEvaluations);

    const updatedEvaluations = currentEvaluations.map((evaluation) => {
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
  }, []); // Remove dependency on state.evaluations to prevent stale closures

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

  // Save human scores function - creates a snapshot of current human scores
  const saveHumanScores = React.useCallback(() => {
    const snapshotId = `human-scores-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Create snapshot of current human scores - ensure we capture the exact scores
    // Add detailed debug logging to trace the values
    console.log('Creating human score snapshot with exact scores:');
    state.evaluations.forEach(evaluation => {
      console.log(`Comment ${evaluation.name} scores:`, {...evaluation.human_scores});
    });
    
    // Create a deeper, more careful copy to ensure no reference issues
    const snapshot: HumanScoreSnapshot = {
      id: snapshotId,
      timestamp,
      evaluationScores: state.evaluations.map(evaluation => {
        // Explicitly copy each score to ensure correct values
        const humanScores = {
          attractiveness: evaluation.human_scores.attractiveness,
          efficiency: evaluation.human_scores.efficiency,
          perspicuity: evaluation.human_scores.perspicuity,
          dependability: evaluation.human_scores.dependability,
          stimulation: evaluation.human_scores.stimulation,
          novelty: evaluation.human_scores.novelty
        };
        return {
          commentId: evaluation.name,
          humanScores
        };
      })
    };
    
    // Add snapshot to history
    setState((prevState) => ({
      ...prevState,
      humanScoreHistory: [snapshot, ...prevState.humanScoreHistory]
    }));
    
    // If we have at least one prompt in history, link this human score snapshot to it
    if (state.promptHistory.length > 0) {
      // Get most recent prompt entry
      const latestPrompt = state.promptHistory[0];
      
      // Create a modified entry with the human score snapshot reference
      const updatedEntry: PromptHistoryEntry = {
        ...latestPrompt,
        humanScoreSnapshotId: snapshotId,
        runId: `${latestPrompt.runId}-human-updated`,
      };
      
      // Update this entry in history with a separate state update to ensure re-render
      // Use functional update to avoid stale state
      setState((prevState) => {
        // Create a completely new array to ensure React detects the change
        const updatedHistory = [updatedEntry, ...prevState.promptHistory.slice(1)];
        console.log('Updating prompt history with human score snapshot:', snapshotId);
        return {
          ...prevState,
          promptHistory: updatedHistory
        };
      });
    }
    
    console.log('Saved human scores snapshot:', snapshot);
    return snapshotId;
  }, [state.evaluations, state.promptHistory]);
  
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
        saveHumanScores,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext);
