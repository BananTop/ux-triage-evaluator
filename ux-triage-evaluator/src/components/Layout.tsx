import React from 'react';
import { 
  AppBar, 
  Box, 
  Container, 
  Toolbar, 
  Typography, 
  Button,
  Stack
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation links
  const navItems = [
    { label: 'Prompt', path: '/' },
    { label: 'Comments', path: '/comments' },
    { label: 'Evaluation', path: '/evaluation' },
    { label: 'Analysis', path: '/analysis' },
    { label: 'History', path: '/history' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UX Triage Evaluator
          </Typography>
          <Stack direction="row" spacing={2}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                variant={location.pathname === item.path ? 'outlined' : 'text'}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>
      <Container 
        component="main" 
        sx={{ 
          mt: 4, 
          mb: 4, 
          flexGrow: 1 
        }}
      >
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            UX Triage Evaluator © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
