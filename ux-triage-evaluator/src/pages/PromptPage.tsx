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
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Attractiveness</Typography>
                <Typography variant="body2">
                  Overall impression, likability, and visual appeal
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Efficiency</Typography>
                <Typography variant="body2">
                  Speed, responsiveness, and ability to complete tasks quickly
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Perspicuity</Typography>
                <Typography variant="body2">
                  Clarity, ease of learning, and understandability
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Dependability</Typography>
                <Typography variant="body2">
                  Reliability, predictability, and stability
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Stimulation</Typography>
                <Typography variant="body2">
                  Excitement, interest, and motivation to use
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Novelty</Typography>
                <Typography variant="body2">
                  Innovation, creativity, and uniqueness
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography variant="body2" paragraph>
          Scoring System: Each dimension should be scored on a scale from -3 (very negative) to +3 (very positive), with 0 being neutral.
        </Typography>
      </Paper>

      <TextField
        label="Enter your LLM prompt"
        multiline
        rows={10}
        value={localPrompt}
        onChange={handlePromptChange}
        fullWidth
        variant="outlined"
        placeholder="Example: You are an expert UX analyst. You will be given app store reviews. Score each review on the 6 UX dimensions (Attractiveness, Efficiency, Perspicuity, Dependability, Stimulation, Novelty) on a scale from -3 to +3. For each dimension, provide a brief justification for your score."
        error={!!error}
        helperText={error}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSavePrompt}
          disabled={!localPrompt.trim()}
        >
          Save Prompt
        </Button>
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
          <Grid container spacing={2}>
            {state.promptHistory.slice(0, 3).map((entry) => (
              <Grid item xs={12} key={entry.id}>
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
              </Grid>
            ))}
          </Grid>
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
