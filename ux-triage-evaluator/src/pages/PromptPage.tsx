import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Alert
} from '@mui/material';
import Layout from '../components/Layout';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const PromptPage: React.FC = () => {
  const { state, setCurrentPrompt } = useAppContext();
  const [localPrompt, setLocalPrompt] = useState(state.currentPrompt);

  // Sync localPrompt with state.currentPrompt when navigating to this page
  React.useEffect(() => {
    setLocalPrompt(state.currentPrompt);
  }, [state.currentPrompt]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrompt(e.target.value);
    setError('');
  };

  const handleSavePrompt = () => {
    if (!localPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    setCurrentPrompt(localPrompt);
    setError('');
  };

  const handleNavigateToComments = () => {
    if (!state.currentPrompt) {
      setError('Please save a prompt first');
      return;
    }
    navigate('/comments');
  };

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        LLM Prompt Editor
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Create a prompt that instructs the LLM how to evaluate app store comments across UX dimensions.
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 3, 
          mb: 4,
          backgroundColor: (theme) => theme.palette.grey[50]
        }}
      >
        <Typography variant="h6" gutterBottom>
          Prompt Guidelines
        </Typography>
        <Typography variant="body2" paragraph>
          Your prompt should instruct the LLM on how to score app store comments on these UX dimensions:
        </Typography>
        <Box display="grid" gridTemplateColumns={{xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'}} gap={2} sx={{ mb: 2 }}>
          <Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Attractiveness</Typography>
                <Typography variant="body2">
                  Overall impression, likability, and visual appeal
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Efficiency</Typography>
                <Typography variant="body2">
                  Speed, responsiveness, and ability to complete tasks quickly
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Perspicuity</Typography>
                <Typography variant="body2">
                  Clarity, ease of learning, and understandability
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Dependability</Typography>
                <Typography variant="body2">
                  Reliability, predictability, and stability
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Stimulation</Typography>
                <Typography variant="body2">
                  Excitement, interest, and motivation to use
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Novelty</Typography>
                <Typography variant="body2">
                  Innovation, creativity, and uniqueness
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
        <Typography variant="body2" paragraph>
          Scoring System: Each dimension should be scored on a scale from -3 (very negative) to +3 (very positive), with 0 being neutral.
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleNavigateToComments}
          disabled={!state.currentPrompt}
        >
          Next: Upload Comments
        </Button>
      </Box>

      {/* Prompt History Preview */}
      {state.promptHistory.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Recent Prompts
          </Typography>
          <Box display="grid" gap={2}>
            {state.promptHistory.slice(0, 3).map((entry) => (
              <Box key={entry.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      {new Date(entry.timestamp).toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        maxHeight: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {entry.prompt}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Overall Alignment: {(entry.overall_alignment_score * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => setLocalPrompt(entry.prompt)}>
                      Use This Prompt
                    </Button>
                    <Button size="small" onClick={() => navigate('/history')}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
          {state.promptHistory.length > 3 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button onClick={() => navigate('/history')}>
                View All Prompts
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Layout>
  );
};

export default PromptPage;
