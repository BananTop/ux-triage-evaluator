import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppProvider } from './contexts/AppContext';

// Import pages (to be created)
const PromptPage = React.lazy(() => import('./pages/PromptPage'));
const CommentsPage = React.lazy(() => import('./pages/CommentsPage'));
const EvaluationPage = React.lazy(() => import('./pages/EvaluationPage'));
const AnalysisPage = React.lazy(() => import('./pages/AnalysisPage'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<PromptPage />} />
              <Route path="/comments" element={<CommentsPage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </React.Suspense>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
