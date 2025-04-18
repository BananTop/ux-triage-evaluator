import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  FormHelperText,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAppContext } from '../contexts/AppContext';
import { LLMModel } from '../models/types';

const SettingsPage: React.FC = () => {
  const { state, updateLLMSettings } = useAppContext();
  const { llmSettings } = state;

  // Local state for form fields
  const [apiKey, setApiKey] = useState(llmSettings.apiKey);
  const [model, setModel] = useState<LLMModel>(llmSettings.model);
  const [customModelName, setCustomModelName] = useState(llmSettings.customModelName || '');
  const [temperature, setTemperature] = useState(llmSettings.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(llmSettings.maxTokens || 1000);
  const [showApiKey, setShowApiKey] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle form submission
  const handleSaveSettings = () => {
    const newSettings = {
      apiKey,
      model,
      temperature,
      maxTokens,
      ...(model === 'custom' ? { customModelName } : {})
    };

    updateLLMSettings(newSettings);
    setSuccessMessage('Settings saved successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Format marks for sliders
  const temperatureMarks = [
    { value: 0, label: '0' },
    { value: 0.5, label: '0.5' },
    { value: 1, label: '1' },
    { value: 1.5, label: '1.5' },
    { value: 2, label: '2' },
  ];

  const tokenMarks = [
    { value: 500, label: '500' },
    { value: 2000, label: '2K' },
    { value: 4000, label: '4K' },
    { value: 8000, label: '8K' },
    { value: 16000, label: '16K' },
  ];

  return (
    <Layout>
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            LLM Configuration
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              API Key
            </Typography>
            <TextField
              fullWidth
              label="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type={showApiKey ? 'text' : 'password'}
              placeholder="Enter your LLM API key"
              helperText="Your API key is stored securely in your browser's local storage"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showApiKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="model-select-label">LLM Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={model}
                label="LLM Model"
                onChange={(e) => setModel(e.target.value as LLMModel)}
              >
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="claude-2">Claude 2</MenuItem>
                <MenuItem value="llama-2">Llama 2</MenuItem>
                <MenuItem value="custom">Custom Model</MenuItem>
              </Select>
              {model === 'custom' && (
                <FormHelperText>
                  Select this option to specify a custom model name
                </FormHelperText>
              )}
            </FormControl>
          </Box>

          {model === 'custom' && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Custom Model Name"
                value={customModelName}
                onChange={(e) => setCustomModelName(e.target.value)}
                placeholder="Enter the custom model identifier"
                helperText="Specify the exact model name or endpoint for your custom LLM"
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Advanced Settings
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography id="temperature-slider" gutterBottom>
              Temperature: {temperature}
            </Typography>
            <Slider
              value={temperature}
              onChange={(_, newValue) => setTemperature(newValue as number)}
              aria-labelledby="temperature-slider"
              min={0}
              max={2}
              step={0.1}
              marks={temperatureMarks}
              valueLabelDisplay="auto"
            />
            <FormHelperText>
              Controls randomness: lower values produce more focused outputs, higher values more creative ones
            </FormHelperText>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography id="tokens-slider" gutterBottom>
              Max Tokens: {maxTokens}
            </Typography>
            <Slider
              value={maxTokens}
              onChange={(_, newValue) => setMaxTokens(newValue as number)}
              aria-labelledby="tokens-slider"
              min={100}
              max={16000}
              step={100}
              marks={tokenMarks}
              valueLabelDisplay="auto"
            />
            <FormHelperText>
              Maximum number of tokens to generate in the completion
            </FormHelperText>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveSettings}
              disabled={!apiKey || (model === 'custom' && !customModelName)}
            >
              Save Settings
            </Button>
          </Box>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Note: These settings will be used when evaluating comments with the LLM. 
          The API key is stored locally in your browser and is never sent to our servers.
        </Typography>
      </Box>
    </Layout>
  );
};

export default SettingsPage;
