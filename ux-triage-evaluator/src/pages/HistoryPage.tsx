import React from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { useAppContext } from '../contexts/AppContext';
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

  // Prepare chart data
  const chartData = {
    labels: state.promptHistory.map((_, index) => `Prompt ${state.promptHistory.length - index}`).reverse(),
    datasets: [
      {
        label: 'Overall Alignment',
        data: [...state.promptHistory].reverse().map(entry => entry.overall_alignment_score * 100),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      ...(Object.keys(dimensionLabels) as Array<keyof typeof dimensionLabels>).map((dimension, index) => ({
        label: dimensionLabels[dimension],
        data: [...state.promptHistory].reverse().map(entry => {
          const dimKey = dimension as keyof typeof entry.dimension_alignments;
          return entry.dimension_alignments[dimKey] * 100;
        }),
        borderColor: `hsl(${index * 30}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 30}, 70%, 50%, 0.5)`,
        hidden: true, // Hide by default to avoid cluttering the chart
      })),
    ],
  };

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
        {state.promptHistory.map((entry, index) => (
          <Box key={entry.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">
                      Prompt {state.promptHistory.length - index}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {new Date(entry.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${Math.round(entry.overall_alignment_score * 100)}% overall alignment`}
                    color={getAlignmentColor(entry.overall_alignment_score)}
                  />
                </Box>

                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 3, 
                    backgroundColor: (theme) => theme.palette.grey[50],
                    maxHeight: '150px',
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {entry.prompt}
                  </Typography>
                </Paper>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Dimension Alignment
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Dimension</TableCell>
                        <TableCell align="right">Score</TableCell>
                        <TableCell align="right">Alignment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(Object.keys(dimensionLabels) as Array<keyof typeof entry.dimension_alignments>).map((key) => (
                        <TableRow key={key}>
                          <TableCell>{dimensionLabels[key]}</TableCell>
                          <TableCell align="right">
                            {entry.dimension_alignments[key].toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${Math.round(entry.dimension_alignments[key] * 100)}%`}
                              color={getAlignmentColor(entry.dimension_alignments[key])}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleUsePrompt(entry.prompt)}>
                  Use This Prompt
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
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
