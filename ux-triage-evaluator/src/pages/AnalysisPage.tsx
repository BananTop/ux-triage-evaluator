import React, { useEffect, useRef, useState } from 'react';
import {
  Typography,
  Paper,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
  TextField
} from '@mui/material';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ScriptableContext, Scale, Tick } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { CommentEvaluation, UXDimension, Score, DimensionScores } from '../models/types';

// Register ChartJS components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Dimension display names
const dimensionLabels: Record<string, string> = {
  attractiveness_alignment: 'Attractiveness',
  efficiency_alignment: 'Efficiency',
  perspicuity_alignment: 'Perspicuity',
  dependability_alignment: 'Dependability',
  stimulation_alignment: 'Stimulation',
  novelty_alignment: 'Novelty',
};

const AnalysisPage: React.FC = () => {
  const { state, addPromptToHistory, setCurrentPrompt, setEvaluations } = useAppContext();
  const navigate = useNavigate();
  const [misalignedComments, setMisalignedComments] = useState<CommentEvaluation[]>([]);
  const [mostAlignedDimension, setMostAlignedDimension] = useState<string>('');
  const [leastAlignedDimension, setLeastAlignedDimension] = useState<string>('');
  const [overallAlignmentScore, setOverallAlignmentScore] = useState(0);
  const [dimensionAverages, setDimensionAverages] = useState<Record<string, number>>({});
  
  // State for prompt refinement
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [refinedPrompt, setRefinedPrompt] = useState(state.currentPrompt);
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false);

  // Reference for the chart canvas (for export)
  const chartRef = useRef<ChartJS<'radar', number[], unknown>>(null);

  useEffect(() => {
    if (state.evaluations.length === 0) {
      return;
    }

    // Calculate overall alignment score
    const totalAlignmentScore = state.evaluations.reduce(
      (sum, evaluation) => sum + evaluation.overall_alignment_score,
      0
    );
    const calculatedOverallAlignmentScore = totalAlignmentScore / state.evaluations.length;
    setOverallAlignmentScore(calculatedOverallAlignmentScore);

    // Calculate average alignment by dimension
    const dimensionSums: Record<string, number> = {};
    const dimensions = [
      'attractiveness_alignment',
      'efficiency_alignment',
      'perspicuity_alignment',
      'dependability_alignment',
      'stimulation_alignment',
      'novelty_alignment',
    ];

    dimensions.forEach((dimension) => {
      const sum = state.evaluations.reduce(
        (total, evaluation) => total + evaluation.dimension_alignments[dimension as keyof typeof evaluation.dimension_alignments],
        0
      );
      dimensionSums[dimension] = sum / state.evaluations.length;
    });
    setDimensionAverages(dimensionSums);

    // Find most and least aligned dimensions
    let highestAlignedDimension = '';
    let highestAlignmentScore = -1;
    let lowestAlignedDimension = '';
    let lowestAlignmentScore = 2;

    Object.entries(dimensionSums).forEach(([dimension, score]) => {
      if (score > highestAlignmentScore) {
        highestAlignmentScore = score;
        highestAlignedDimension = dimension;
      }
      if (score < lowestAlignmentScore) {
        lowestAlignmentScore = score;
        lowestAlignedDimension = dimension;
      }
    });

    setMostAlignedDimension(highestAlignedDimension);
    setLeastAlignedDimension(lowestAlignedDimension);

    // Find comments with lowest alignment scores
    const sortedComments = [...state.evaluations].sort(
      (a, b) => a.overall_alignment_score - b.overall_alignment_score
    );
    setMisalignedComments(sortedComments.slice(0, 3));

    // Save this analysis to prompt history
    if (state.currentPrompt && state.evaluations.length > 0) {
      addPromptToHistory({
        id: Date.now().toString(),
        prompt: state.currentPrompt,
        timestamp: new Date().toISOString(),
        overall_alignment_score: calculatedOverallAlignmentScore,
        dimension_alignments: {
          attractiveness_alignment: dimensionSums.attractiveness_alignment,
          efficiency_alignment: dimensionSums.efficiency_alignment,
          perspicuity_alignment: dimensionSums.perspicuity_alignment,
          dependability_alignment: dimensionSums.dependability_alignment,
          stimulation_alignment: dimensionSums.stimulation_alignment,
          novelty_alignment: dimensionSums.novelty_alignment,
        },
      });
    }
  }, [state.evaluations, state.currentPrompt, addPromptToHistory]);

  // Prepare chart data
  const chartData = {
    labels: Object.values(dimensionLabels),
    datasets: [
      {
        label: 'Alignment Score',
        data: Object.keys(dimensionLabels).map(
          (key) => (dimensionAverages[key] || 0) * 100
        ),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75, 192, 192)',
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function(this: Scale<any>, tickValue: number | string, index: number, ticks: Tick[]) {
            return `${Number(tickValue)}%`;
          },
        },
        pointLabels: {
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Handle running analysis with refined prompt
  const handleUpdatePrompt = () => {
    if (!refinedPrompt.trim()) {
      return;
    }
    
    setIsAnalysisRunning(true);
    
    // Update the current prompt
    setCurrentPrompt(refinedPrompt);
    
    // Simulate LLM analysis (in a real app, this would call an API with the refined prompt)
    setTimeout(() => {
      try {
        // Step 1: Mock updating LLM scores while preserving human scores
        const updatedEvaluations = state.evaluations.map(evaluation => {
          // Generate new random LLM scores for demonstration (ensuring they're valid Score type values)
          const getRandomScore = (): Score => {
            const scores: Score[] = [-3, -2, -1, 0, 1, 2, 3];
            return scores[Math.floor(Math.random() * scores.length)];
          };
          
          const randomScores: DimensionScores = {
            attractiveness: getRandomScore(),
            efficiency: getRandomScore(),
            perspicuity: getRandomScore(),
            dependability: getRandomScore(),
            stimulation: getRandomScore(),
            novelty: getRandomScore(),
          };
          
          // Generate new justifications - in a real app, these would come from the LLM
          const randomJustifications = {
            attractiveness: `Based on the refined prompt, the comment suggests ${randomScores.attractiveness > 0 ? 'positive' : randomScores.attractiveness < 0 ? 'negative' : 'neutral'} attractiveness.`,
            efficiency: `The app's efficiency appears ${randomScores.efficiency > 0 ? 'good' : randomScores.efficiency < 0 ? 'poor' : 'average'} according to this analysis.`,
            perspicuity: `User finds the app ${randomScores.perspicuity > 0 ? 'easy' : randomScores.perspicuity < 0 ? 'hard' : 'moderately easy'} to understand.`,
            dependability: `The app shows ${randomScores.dependability > 0 ? 'good' : randomScores.dependability < 0 ? 'poor' : 'average'} reliability.`,
            stimulation: `User appears ${randomScores.stimulation > 0 ? 'engaged' : randomScores.stimulation < 0 ? 'disinterested' : 'neutral'} with the app.`,
            novelty: `The app offers ${randomScores.novelty > 0 ? 'innovative' : randomScores.novelty < 0 ? 'common' : 'standard'} features.`,
          };
          
          // Step 2: Calculate new alignment scores for each evaluation
          const dimensionAlignments = {
            attractiveness_alignment: calculateSingleAlignment(
              randomScores.attractiveness,
              evaluation.human_scores.attractiveness
            ),
            efficiency_alignment: calculateSingleAlignment(
              randomScores.efficiency,
              evaluation.human_scores.efficiency
            ),
            perspicuity_alignment: calculateSingleAlignment(
              randomScores.perspicuity,
              evaluation.human_scores.perspicuity
            ),
            dependability_alignment: calculateSingleAlignment(
              randomScores.dependability,
              evaluation.human_scores.dependability
            ),
            stimulation_alignment: calculateSingleAlignment(
              randomScores.stimulation,
              evaluation.human_scores.stimulation
            ),
            novelty_alignment: calculateSingleAlignment(
              randomScores.novelty,
              evaluation.human_scores.novelty
            ),
          };
          
          // Calculate the overall alignment score
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
            llm_scores: randomScores,
            llm_justification: randomJustifications,
            dimension_alignments: dimensionAlignments,
            overall_alignment_score: overallAlignmentScore
          };
        });
        
        // Step 3: Update evaluations with new LLM scores and alignment scores
        setEvaluations(updatedEvaluations);
        
        // Step 4: Force a recalculation of the analysis page metrics
        // We need to manually calculate the new averages since we haven't triggered the useEffect
        const newDimensionAverages: Record<string, number> = {};
        const dimensions = [
          'attractiveness_alignment',
          'efficiency_alignment',
          'perspicuity_alignment',
          'dependability_alignment',
          'stimulation_alignment',
          'novelty_alignment',
        ];
        
        // Calculate new dimension averages
        dimensions.forEach((dimension) => {
          const sum = updatedEvaluations.reduce(
            (total, evaluation) => total + evaluation.dimension_alignments[dimension as keyof typeof evaluation.dimension_alignments],
            0
          );
          newDimensionAverages[dimension] = sum / updatedEvaluations.length;
        });
        
        // Calculate new overall alignment score
        const newOverallScore = updatedEvaluations.reduce(
          (sum, evaluation) => sum + evaluation.overall_alignment_score,
          0
        ) / updatedEvaluations.length;
        
        // Update state with new calculations
        setOverallAlignmentScore(newOverallScore);
        setDimensionAverages(newDimensionAverages);
        
        // Find new most and least aligned dimensions
        let highestAlignedDimension = '';
        let highestAlignmentScore = -1;
        let lowestAlignedDimension = '';
        let lowestAlignmentScore = 2;
        
        Object.entries(newDimensionAverages).forEach(([dimension, score]) => {
          if (score > highestAlignmentScore) {
            highestAlignmentScore = score;
            highestAlignedDimension = dimension;
          }
          if (score < lowestAlignmentScore) {
            lowestAlignmentScore = score;
            lowestAlignedDimension = dimension;
          }
        });
        
        setMostAlignedDimension(highestAlignedDimension);
        setLeastAlignedDimension(lowestAlignedDimension);
        
        // Step 5: Update misaligned comments
        const sortedComments = [...updatedEvaluations].sort(
          (a, b) => a.overall_alignment_score - b.overall_alignment_score
        );
        setMisalignedComments(sortedComments.slice(0, 3));
        
        // Step 6: Add the new prompt to history with the correctly calculated metrics
        addPromptToHistory({
          id: Date.now().toString(),
          prompt: refinedPrompt,
          timestamp: new Date().toISOString(),
          overall_alignment_score: newOverallScore,
          dimension_alignments: newDimensionAverages as any, // type cast for compatibility
        });
        
        // Step 7: Hide the prompt editor and reset loading state
        setShowPromptEditor(false);
        setIsAnalysisRunning(false);
      } catch (error) {
        console.error('Error updating analysis:', error);
        setIsAnalysisRunning(false);
      }
    }, 1500); // Simulate API delay
  };
  
  // Helper function to calculate alignment between two scores
  // Returns value between 0 (no alignment) and 1 (perfect alignment)
  const calculateSingleAlignment = (llmScore: number, humanScore: number): number => {
    // Maximum possible difference is 6 (from -3 to +3)
    const difference = Math.abs(llmScore - humanScore);
    // Convert to alignment score (0-1 range)
    return 1 - (difference / 6);
  };
  
  // Export JSON results
  const handleExportResults = () => {
    // Prepare the data to export
    const exportData = state.evaluations.map((evaluation) => ({
      name: evaluation.name,
      date: evaluation.date,
      text: evaluation.text,
      stars: evaluation.stars,
      llm_scores: evaluation.llm_scores,
      llm_justification: evaluation.llm_justification,
      human_scores: evaluation.human_scores,
      overall_alignment_score: evaluation.overall_alignment_score,
      dimension_alignments: evaluation.dimension_alignments,
    }));

    // Create a blob and download link
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ux-triage-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to get color based on alignment score
  const getAlignmentColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.5) return 'primary';
    if (score >= 0.3) return 'warning';
    return 'error';
  };

  if (state.evaluations.length === 0) {
    return (
      <Layout>
        <Alert severity="warning" sx={{ mb: 4 }}>
          No evaluations available. Please complete the evaluation process first.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/evaluation')}>
          Go to Evaluation Page
        </Button>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        Analysis Results
      </Typography>

      <Box display="grid" gridTemplateColumns={{xs: '1fr', md: 'repeat(3, 1fr)'}} gap={4}>
        {/* Overall Alignment Score */}
        <Box>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Overall Alignment
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                my: 3,
              }}
            >
              <Box
                sx={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '8px solid',
                  borderColor: (theme) => {
                    const score = overallAlignmentScore;
                    if (score >= 0.8) return theme.palette.success.main;
                    if (score >= 0.5) return theme.palette.primary.main;
                    if (score >= 0.3) return theme.palette.warning.main;
                    return theme.palette.error.main;
                  },
                }}
              >
                <Typography variant="h3">
                  {Math.round(overallAlignmentScore * 100)}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" align="center">
              {overallAlignmentScore >= 0.8
                ? 'Excellent alignment between LLM and human evaluations!'
                : overallAlignmentScore >= 0.5
                ? 'Good alignment between LLM and human evaluations.'
                : overallAlignmentScore >= 0.3
                ? 'Moderate alignment between LLM and human evaluations.'
                : 'Poor alignment between LLM and human evaluations.'}
            </Typography>
          </Paper>
        </Box>

        {/* Alignment Highlights */}
        <Box sx={{ gridColumn: {md: 'span 2'} }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Alignment Highlights
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Best Aligned Dimension
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  label={dimensionLabels[mostAlignedDimension] || ''}
                  color="success"
                  sx={{ mr: 2 }}
                />
                <Typography variant="body2">
                  {Math.round((dimensionAverages[mostAlignedDimension] || 0) * 100)}% alignment
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This dimension shows the strongest agreement between the LLM and human evaluations.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Least Aligned Dimension
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  label={dimensionLabels[leastAlignedDimension] || ''}
                  color="error"
                  sx={{ mr: 2 }}
                />
                <Typography variant="body2">
                  {Math.round((dimensionAverages[leastAlignedDimension] || 0) * 100)}% alignment
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This dimension shows the weakest agreement between the LLM and human evaluations.
                Consider refining your prompt to better evaluate this aspect.
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Alignment Radar Chart */}
        <Box>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dimension Alignment
            </Typography>
            <Box sx={{ height: 400, mt: 3 }}>
              <Radar ref={chartRef} data={chartData} options={chartOptions} />
            </Box>
          </Paper>
        </Box>

        {/* Dimension Alignment Table */}
        <Box>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dimension Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Dimension</TableCell>
                    <TableCell align="center">Alignment</TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(dimensionLabels).map(([key, label]) => (
                    <TableRow key={key}>
                      <TableCell>{label}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${Math.round((dimensionAverages[key] || 0) * 100)}%`}
                          color={getAlignmentColor(dimensionAverages[key] || 0)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {(dimensionAverages[key] || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Misaligned Comments */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Most Misaligned Comments
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              These comments had the largest differences between LLM and human evaluations.
              Reviewing these could help improve the prompt.
            </Typography>
            
            <Box display="grid" gap={3}>
              {misalignedComments.map((comment) => (
                <Box key={`${comment.name}-${comment.date}`}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1">
                          Name: {comment.name}
                        </Typography>
                        <Chip
                          label={`${Math.round(comment.overall_alignment_score * 100)}% aligned`}
                          color={getAlignmentColor(comment.overall_alignment_score)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" paragraph>
                        {comment.text}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Dimension Comparison
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Dimension</TableCell>
                              <TableCell align="center">LLM Score</TableCell>
                              <TableCell align="center">Human Score</TableCell>
                              <TableCell align="right">Alignment</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(Object.keys(dimensionLabels) as (keyof typeof comment.dimension_alignments)[]).map((key) => {
                              const dimensionKey = key.split('_')[0] as UXDimension;
                              return (
                                <TableRow key={key}>
                                  <TableCell>{dimensionLabels[key]}</TableCell>
                                  <TableCell align="center">{comment.llm_scores[dimensionKey]}</TableCell>
                                  <TableCell align="center">{comment.human_scores[dimensionKey]}</TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={`${Math.round(comment.dimension_alignments[key] * 100)}%`}
                                      color={getAlignmentColor(comment.dimension_alignments[key])}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/evaluation')}>
              Back to Evaluation
            </Button>
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExportResults}
                sx={{ mr: 2 }}
              >
                Export Results
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowPromptEditor(!showPromptEditor)}
              >
                Refine Prompt
              </Button>
            </Box>
          </Box>
          
          {/* Prompt Refinement UI */}
          {showPromptEditor && (
            <Paper elevation={3} sx={{ mt: 3, p: 3, gridColumn: '1 / -1' }}>
              <Typography variant="h6" gutterBottom>
                Refine Your Prompt
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Edit your prompt below to improve LLM analysis. Human scores will be preserved.
              </Typography>
              
              <TextField
                label="Edit Prompt"
                multiline
                rows={4}
                value={refinedPrompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRefinedPrompt(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowPromptEditor(false)}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdatePrompt}
                  disabled={!refinedPrompt.trim() || isAnalysisRunning}
                >
                  {isAnalysisRunning ? 'Updating...' : 'Update Prompt & Rerun Analysis'}
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default AnalysisPage;
