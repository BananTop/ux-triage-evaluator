import React, { useState, useRef } from 'react';
import {
  Typography,
  Paper,
  Button,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Rating,
  Chip,
  TextField,
  Grid
} from '@mui/material';
import Layout from '../components/Layout';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { CommentInput } from '../models/types';

const CommentsPage: React.FC = () => {
  const { state, setComments } = useAppContext();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [jsonText, setJsonText] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        
        // Validate if it's an array or single object
        const commentsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        // Validate each comment has required fields
        const validComments = commentsArray.filter((comment): comment is CommentInput => {
          return (
            comment &&
            typeof comment.review_id === 'string' && 
            typeof comment.review_text === 'string' &&
            typeof comment.star_rating === 'number'
          );
        });

        if (validComments.length === 0) {
          setError('No valid comments found in the file. Each comment needs a review_id, review_text, and star_rating.');
          return;
        }

        setComments(validComments);
        setSuccess(`Successfully loaded ${validComments.length} comment${validComments.length === 1 ? '' : 's'}.`);
        setError('');
        // Clear the file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setError('Failed to parse JSON file. Please check the file format.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteJson = () => {
    try {
      if (!jsonText.trim()) {
        setError('Please enter some JSON data.');
        return;
      }

      const jsonData = JSON.parse(jsonText);
      
      // Validate if it's an array or single object
      const commentsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      // Validate each comment has required fields
      const validComments = commentsArray.filter((comment): comment is CommentInput => {
        return (
          comment &&
          typeof comment.review_id === 'string' && 
          typeof comment.review_text === 'string' &&
          typeof comment.star_rating === 'number'
        );
      });

      if (validComments.length === 0) {
        setError('No valid comments found in the input. Each comment needs a review_id, review_text, and star_rating.');
        return;
      }

      setComments(validComments);
      setSuccess(`Successfully loaded ${validComments.length} comment${validComments.length === 1 ? '' : 's'}.`);
      setError('');
      setJsonText('');
      setShowJsonInput(false);
    } catch (err) {
      setError('Failed to parse JSON. Please check the format.');
      console.error(err);
    }
  };

  const handleClearComments = () => {
    setComments([]);
    setSuccess('Comments cleared.');
  };

  const handleProceedToEvaluation = () => {
    if (state.comments.length === 0) {
      setError('Please upload at least one comment before proceeding.');
      return;
    }
    navigate('/evaluation');
  };

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom>
        App Store Comments
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Upload app store comments for UX evaluation.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload Comments
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            ref={fileInputRef}
            id="comment-file-input"
          />
          <Button
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
            sx={{ mr: 2 }}
          >
            Upload JSON File
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowJsonInput(!showJsonInput)}
          >
            {showJsonInput ? 'Hide JSON Input' : 'Paste JSON'}
          </Button>
        </Box>

        {showJsonInput && (
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Paste JSON here"
              multiline
              rows={10}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder='{"review_id": "example_id", "review_text": "This app is amazing!", "star_rating": 5}'
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handlePasteJson}>
              Process JSON
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Example Format:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: (theme) => theme.palette.grey[50] }}>
            <pre style={{ margin: 0, overflow: 'auto' }}>
              {JSON.stringify({
                review_id: "example_id_123",
                review_text: "This app is great but could use some improvements in the UI.",
                star_rating: 4
              }, null, 2)}
            </pre>
          </Paper>
        </Box>
      </Paper>

      {state.comments.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Loaded Comments ({state.comments.length})
            </Typography>
            <Button variant="outlined" color="error" onClick={handleClearComments}>
              Clear All
            </Button>
          </Box>
          
          <List>
            {state.comments.map((comment, index) => (
              <React.Fragment key={comment.review_id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Typography variant="subtitle2" color="primary">
                          ID: {comment.review_id}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={comment.star_rating} readOnly max={5} />
                          <Chip 
                            label={`${comment.star_rating}/5`} 
                            size="small" 
                            sx={{ ml: 1 }}
                            color={comment.star_rating >= 4 ? 'success' : comment.star_rating <= 2 ? 'error' : 'warning'}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {comment.review_text}
                          </Typography>
                        }
                      />
                    </Grid>
                  </Grid>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Back to Prompt
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleProceedToEvaluation}
          disabled={state.comments.length === 0}
        >
          Next: Evaluation
        </Button>
      </Box>
    </Layout>
  );
};

export default CommentsPage;
