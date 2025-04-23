import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { useAppContext } from '../contexts/AppContext';
import { HumanScoreSnapshot } from '../models/types';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Dimension display names
const dimensionLabels: Record<string, string> = {
  attractiveness_alignment: 'Attractiveness',
  efficiency_alignment: 'Efficiency',
  perspicuity_alignment: 'Perspicuity',
  dependability_alignment: 'Dependability',
  stimulation_alignment: 'Stimulation',
  novelty_alignment: 'Novelty',
};

const HistoryPage: React.FC = () => {
  const { state, setCurrentPrompt } = useAppContext();
  const navigate = useNavigate();

  // Prepare chart data - forces a recalculation whenever state changes
  // Using useMemo to optimize but still refresh when needed
  const chartData = React.useMemo(() => {
    console.log('Recalculating chart data with prompt history length:', state.promptHistory.length);
    
    // Create reversed array once to avoid multiple reversals
    const reversedHistory = [...state.promptHistory].reverse();
    
    return {
      labels: reversedHistory.map((_, index) => `Prompt ${state.promptHistory.length - index}`),
      datasets: [
        {
          label: 'Overall Alignment',
          data: reversedHistory.map(entry => entry.overall_alignment_score * 100),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        ...(Object.keys(dimensionLabels) as Array<keyof typeof dimensionLabels>).map((dimension, index) => ({
          label: dimensionLabels[dimension],
          data: reversedHistory.map(entry => {
            const dimKey = dimension as keyof typeof entry.dimension_alignments;
            return entry.dimension_alignments[dimKey] * 100;
          }),
          borderColor: `hsl(${index * 30}, 70%, 50%)`,
          backgroundColor: `hsla(${index * 30}, 70%, 50%, 0.5)`,
          hidden: false // Show dimensions by default
        })),
      ],
    };
  }, [state.promptHistory]); // Recalculate when promptHistory changes

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Alignment Score (%)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Function to get color based on alignment score
  const getAlignmentColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.5) return 'primary';
    if (score >= 0.3) return 'warning';
    return 'error';
  };
  
  // Function to find human score snapshot for a prompt entry
  const getHumanScoreSnapshot = (snapshotId?: string): HumanScoreSnapshot | undefined => {
    if (!snapshotId) return undefined;
    return state.humanScoreHistory.find(snapshot => snapshot.id === snapshotId);
  };

  // Force refresh when navigating to this page or when state changes
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  React.useEffect(() => {
    // Force a re-render when the component mounts
    forceUpdate();
    // And whenever prompt history or human score history changes
  }, [state.promptHistory, state.humanScoreHistory]);

  const handleUsePrompt = (prompt: string) => {
    setCurrentPrompt(prompt);
    navigate('/');
  };

  if (state.promptHistory.length === 0) {
    return (
      <Layout>
        <Alert severity="info" sx={{ mb: 4 }}>
          No prompt history available. Complete at least one evaluation cycle to see results here.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Prompt Page
        </Button>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        Prompt History
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Review past prompts and their alignment scores to identify improvements.
      </Typography>

      {/* Trend Chart */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Alignment Trend
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          This chart shows how alignment scores have changed across different prompts.
          Click on legend items to show/hide dimension-specific trends.
        </Typography>
        <Box sx={{ height: 400, mt: 3 }}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </Paper>

      {/* Prompt History Cards */}
      <Box display="grid" gap={3}>
        {state.promptHistory.map((entry, index) => {
          // Find human score snapshot if available
          const humanScoreSnapshot = getHumanScoreSnapshot(entry.humanScoreSnapshotId);
          
          return (
            <Paper key={entry.id} elevation={2} sx={{ mb: 4, overflow: 'hidden' }}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Prompt {state.promptHistory.length - index}
                  </Typography>
                  <Chip 
                    label={`${Math.round(entry.overall_alignment_score * 100)}% overall alignment`}
                    color={getAlignmentColor(entry.overall_alignment_score)}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  {new Date(entry.timestamp).toLocaleString()}
                  {humanScoreSnapshot && (
                    <span> • Human scores saved</span>
                  )}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
                  <Typography>{entry.prompt}</Typography>
                </Paper>
                
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Dimension Alignment
                </Typography>
                <Box sx={{ display: 'table', width: '100%', mb: 3 }}>
                  <Box sx={{ display: 'table-header-group', backgroundColor: '#f5f5f5' }}>
                    <Box sx={{ display: 'table-row' }}>
                      <Typography sx={{ display: 'table-cell', p: 1, fontWeight: 'bold' }}>Dimension</Typography>
                      <Typography sx={{ display: 'table-cell', p: 1, fontWeight: 'bold', textAlign: 'right' }}>LLM Score</Typography>
                      <Typography sx={{ display: 'table-cell', p: 1, fontWeight: 'bold', textAlign: 'right' }}>Human Score</Typography>
                      <Typography sx={{ display: 'table-cell', p: 1, fontWeight: 'bold', textAlign: 'right' }}>Alignment</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'table-row-group' }}>
                    {Object.entries(dimensionLabels).map(([key, label]) => {
                      const dimensionKey = key.replace('_alignment', '') as 'attractiveness' | 'efficiency' | 'perspicuity' | 'dependability' | 'stimulation' | 'novelty';
                      const alignmentScore = entry.dimension_alignments[key as keyof typeof entry.dimension_alignments];
                      
                      // Get human score for this dimension from the snapshot if available
                      let humanScore: number | null = null;
                      if (humanScoreSnapshot && humanScoreSnapshot.evaluationScores.length > 0) {
                        // Calculate average human score more efficiently
                        let total = 0;
                        let validScores = 0;
                        
                        // Loop through scores and calculate sum and count in one pass
                        for (const scoreObj of humanScoreSnapshot.evaluationScores) {
                          if (scoreObj.humanScores && typeof scoreObj.humanScores[dimensionKey] === 'number') {
                            total += scoreObj.humanScores[dimensionKey];
                            validScores++;
                          }
                        }
                        
                        // Calculate average if we have valid scores
                        if (validScores > 0) {
                          humanScore = total / validScores;
                        }
                      }
                      
                      return (
                        <Box key={key} sx={{ display: 'table-row' }}>
                          <Typography sx={{ display: 'table-cell', p: 1 }}>{label}</Typography>
                          <Typography sx={{ display: 'table-cell', p: 1, textAlign: 'right' }}>
                            {entry.llmScores ? entry.llmScores[dimensionKey].toFixed(1) : 'N/A'}
                          </Typography>
                          <Typography sx={{ display: 'table-cell', p: 1, textAlign: 'right' }}>
                            {humanScore !== null ? humanScore.toFixed(1) : 'N/A'}
                          </Typography>
                          <Typography sx={{ display: 'table-cell', p: 1, textAlign: 'right' }}>
                            <Chip 
                              size="small"
                              label={`${Math.round(alignmentScore * 100)}%`} 
                              color={getAlignmentColor(alignmentScore)}
                            />
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
                
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => handleUsePrompt(entry.prompt)}
                >
                  USE THIS PROMPT
                </Button>
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Back to Prompt Page
        </Button>
      </Box>
    </Layout>
  );
};

export default HistoryPage;
