import React, { useState } from 'react';
import {
  Typography,
  Paper,
  Button,
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Grid,
  Rating,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Alert,
  Stack
} from '@mui/material';
import Layout from '../components/Layout';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Score, UXDimension, DimensionScores } from '../models/types';

// Available score options
const scoreOptions: Score[] = [-3, -2, -1, 0, 1, 2, 3];

// Score descriptions for tooltip
const scoreDescriptions: Record<Score, string> = {
  [-3]: 'Extremely negative / Poor',
  [-2]: 'Very negative',
  [-1]: 'Somewhat negative',
  [0]: 'Neutral',
  [1]: 'Somewhat positive',
  [2]: 'Very positive',
  [3]: 'Extremely positive / Excellent',
};

// Dimension display names and descriptions
const dimensionInfo: Record<UXDimension, { name: string; description: string }> = {
  attractiveness: {
    name: 'Attractiveness',
    description: 'Overall impression, likability, and visual appeal',
  },
  efficiency: {
    name: 'Efficiency',
    description: 'Speed, responsiveness, and ability to complete tasks quickly',
  },
  perspicuity: {
    name: 'Perspicuity',
    description: 'Clarity, ease of learning, and understandability',
  },
  dependability: {
    name: 'Dependability',
    description: 'Reliability, predictability, and stability',
  },
  stimulation: {
    name: 'Stimulation',
    description: 'Excitement, interest, and motivation to use',
  },
  novelty: {
    name: 'Novelty',
    description: 'Innovation, creativity, and uniqueness',
  },
};

const EvaluationPage: React.FC = () => {
  const {
    state,
    setEvaluations,
    setSelectedCommentIndex,
    toggleHideLLMScores,
    calculateAlignmentScores,
  } = useAppContext();
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const currentCommentIndex = state.selectedCommentIndex;
  const currentComment = state.comments[currentCommentIndex];
  const currentEvaluation = state.evaluations[currentCommentIndex];

  // In a real application, this would call an actual LLM API
  const handleRunLLMAnalysis = () => {
    setIsAnalysisRunning(true);
    setError('');

    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // Mock LLM analysis - in a real app, this would come from an API
        const updatedEvaluations = state.evaluations.map((evaluation) => {
          // Generate random scores for the mock LLM
          const mockLLMScores: DimensionScores = {
            attractiveness: scoreOptions[Math.floor(Math.random() * scoreOptions.length)],
            efficiency: scoreOptions[Math.floor(Math.random() * scoreOptions.length)],
            perspicuity: scoreOptions[Math.floor(Math.random() * scoreOptions.length)],
            dependability: scoreOptions[Math.floor(Math.random() * scoreOptions.length)],
            stimulation: scoreOptions[Math.floor(Math.random() * scoreOptions.length)],
            novelty: scoreOptions[Math.floor(Math.random() * scoreOptions.length)],
          };

          // Generate mock justifications
          const mockJustifications = {
            attractiveness: `The comment ${mockLLMScores.attractiveness > 0 ? 'indicates positive' : mockLLMScores.attractiveness < 0 ? 'shows negative' : 'has neutral'} feelings about the app's attractiveness.`,
            efficiency: `Based on the review, the app's efficiency appears to be ${mockLLMScores.efficiency > 0 ? 'good' : mockLLMScores.efficiency < 0 ? 'poor' : 'average'}.`,
            perspicuity: `The user finds the app ${mockLLMScores.perspicuity > 0 ? 'easy' : mockLLMScores.perspicuity < 0 ? 'difficult' : 'moderately easy'} to understand and use.`,
            dependability: `The app ${mockLLMScores.dependability > 0 ? 'seems reliable' : mockLLMScores.dependability < 0 ? 'shows signs of unreliability' : 'has average reliability'} based on the review.`,
            stimulation: `The user appears ${mockLLMScores.stimulation > 0 ? 'engaged and interested' : mockLLMScores.stimulation < 0 ? 'bored or disinterested' : 'neither particularly engaged nor disinterested'} in using the app.`,
            novelty: `The app ${mockLLMScores.novelty > 0 ? 'offers innovative features' : mockLLMScores.novelty < 0 ? 'lacks originality' : 'has some standard features'} according to this review.`,
          };

          return {
            ...evaluation,
            llm_scores: mockLLMScores,
            llm_justification: mockJustifications,
          };
        });

        setEvaluations(updatedEvaluations);
        setIsAnalysisRunning(false);
        setAnalysisSuccess(true);
      } catch (err) {
        console.error('Error in LLM analysis:', err);
        setError('Failed to analyze comments. Please try again.');
        setIsAnalysisRunning(false);
      }
    }, 2000); // Simulate 2 second API call
  };

  const handleScoreChange = (dimension: UXDimension, score: Score) => {
    const updatedEvaluations = [...state.evaluations];
    updatedEvaluations[currentCommentIndex] = {
      ...updatedEvaluations[currentCommentIndex],
      human_scores: {
        ...updatedEvaluations[currentCommentIndex].human_scores,
        [dimension]: score,
      },
    };
    setEvaluations(updatedEvaluations);
  };

  const handleCommentNavigation = (direction: 'prev' | 'next') => {
    let newIndex = currentCommentIndex;
    if (direction === 'prev' && currentCommentIndex > 0) {
      newIndex = currentCommentIndex - 1;
    } else if (direction === 'next' && currentCommentIndex < state.comments.length - 1) {
      newIndex = currentCommentIndex + 1;
    }
    setSelectedCommentIndex(newIndex);
  };

  const handleProceedToAnalysis = () => {
    // Calculate alignment scores before proceeding
    calculateAlignmentScores();
    navigate('/analysis');
  };

  const getScoreColor = (score: Score) => {
    if (score > 1) return 'success';
    if (score < -1) return 'error';
    if (score < 0) return 'warning';
    return 'primary';
  };

  if (!currentComment || !currentEvaluation) {
    return (
      <Layout>
        <Alert severity="warning" sx={{ mb: 4 }}>
          No comments available for evaluation. Please upload comments first.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/comments')}>
          Go to Comments Page
        </Button>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        UX Dimension Evaluation
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              LLM Analysis
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={state.hideLLMScores}
                  onChange={toggleHideLLMScores}
                  color="primary"
                />
              }
              label="Hide LLM Scores"
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {analysisSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              LLM analysis completed successfully!
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleRunLLMAnalysis}
            disabled={isAnalysisRunning}
            fullWidth
            sx={{ mb: 2 }}
          >
            {isAnalysisRunning ? 'Analyzing...' : 'Run LLM Analysis'}
          </Button>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Current LLM Prompt"
              multiline
              rows={3}
              value={state.currentPrompt}
              fullWidth
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">
                Comment {currentCommentIndex + 1} of {state.comments.length}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                ID: {currentComment.review_id}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={currentComment.star_rating} readOnly max={5} sx={{ mr: 1 }} />
              <Chip
                label={`${currentComment.star_rating}/5`}
                color={currentComment.star_rating >= 4 ? 'success' : currentComment.star_rating <= 2 ? 'error' : 'warning'}
              />
            </Box>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: (theme) => theme.palette.grey[50] }}>
            <Typography variant="body1">{currentComment.review_text}</Typography>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Button
              variant="outlined"
              onClick={() => handleCommentNavigation('prev')}
              disabled={currentCommentIndex === 0}
            >
              Previous Comment
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleCommentNavigation('next')}
              disabled={currentCommentIndex === state.comments.length - 1}
            >
              Next Comment
            </Button>
          </Box>
        </Paper>
      </Box>

      <Box display="grid" gridTemplateColumns={{xs: '1fr', md: 'repeat(2, 1fr)'}} gap={3}>
        {/* Human Evaluation */}
        <Box>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Your Evaluation
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Score each UX dimension from -3 (very negative) to +3 (very positive)
            </Typography>

            <Stack spacing={3} sx={{ mt: 3 }}>
              {(Object.keys(dimensionInfo) as UXDimension[]).map((dimension) => (
                <FormControl key={dimension} fullWidth>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InputLabel id={`${dimension}-label`} shrink={false}>
                      {dimensionInfo[dimension].name}
                    </InputLabel>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      {dimensionInfo[dimension].description}
                    </Typography>
                  </Box>
                  
                  <Select
                    labelId={`${dimension}-label`}
                    value={currentEvaluation.human_scores[dimension].toString()}
                    onChange={(e: SelectChangeEvent<string>) => {
                      handleScoreChange(dimension, parseInt(e.target.value) as Score);
                    }}
                    displayEmpty
                  >
                    {scoreOptions.map((score) => (
                      <MenuItem key={score} value={score.toString()}>
                        {score} - {scoreDescriptions[score]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* LLM Evaluation */}
        <Box>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              LLM Evaluation
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              The LLM's scores and justifications for this comment
            </Typography>

            {state.hideLLMScores ? (
              <Alert severity="info" sx={{ mt: 3 }}>
                LLM scores are hidden to prevent bias in your evaluation.
              </Alert>
            ) : (
              <Stack spacing={3} sx={{ mt: 3 }}>
                {(Object.keys(dimensionInfo) as UXDimension[]).map((dimension) => (
                  <Box key={dimension}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {dimensionInfo[dimension].name}
                      </Typography>
                      <Chip
                        label={currentEvaluation.llm_scores[dimension]}
                        color={getScoreColor(currentEvaluation.llm_scores[dimension])}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                      {currentEvaluation.llm_justification[dimension] || 'No justification provided.'}
                    </Typography>
                    <Divider />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/comments')}>
          Back to Comments
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleProceedToAnalysis}
        >
          Next: View Analysis
        </Button>
      </Box>
    </Layout>
  );
};

export default EvaluationPage;
