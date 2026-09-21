/** @jsxImportSource @emotion/react */
import React from 'react';
import styled from '@emotion/styled';
import { Box, AppBar, Toolbar, Typography, Container, Grid, Paper } from '@mui/material';
import { css } from '@emotion/react';

// Emotion styled components with advanced styling
const StyledAppBar = styled(AppBar)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
`;

const StyledContent = styled(Container)`
  padding: 40px 20px;
  min-height: calc(100vh - 64px);
`;

const StyledPaper = styled(Paper)`
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const heroStyles = css`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 16px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
  
  p {
    font-size: 1.2rem;
    opacity: 0.95;
  }
`;

/**
 * Minimal Layout with Material UI + Emotion Integration
 * Demonstrates how to use both libraries together in your application
 */
export const MuiEmotionLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Header */}
      <StyledAppBar position="static" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '0.5px',
            }}
          >
            Material UI + Emotion
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            React Vite App
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Main Content */}
      <StyledContent maxWidth="lg">
        {/* Hero Section */}
        <div css={heroStyles}>
          <Typography variant="h1" component="h1">
            Welcome to Your App
          </Typography>
          <Typography variant="body1">
            Built with React, Vite, Material UI, and Emotion CSS-in-JS
          </Typography>
        </div>

        {/* Feature Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'Material UI',
              description: 'Comprehensive component library with built-in Material Design principles',
            },
            {
              title: 'Emotion CSS-in-JS',
              description: 'Powerful, flexible CSS-in-JS library for dynamic styling',
            },
            {
              title: 'React Router v6',
              description: 'Modern client-side routing with nested routes and data loading',
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StyledPaper elevation={0}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#667eea' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {feature.description}
                </Typography>
              </StyledPaper>
            </Grid>
          ))}
        </Grid>

        {/* Children Content */}
        {children && <Box>{children}</Box>}
      </StyledContent>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          © 2025 Your App. All rights reserved. | Material UI + Emotion Integration
        </Typography>
      </Box>
    </Box>
  );
};

export default MuiEmotionLayout;
