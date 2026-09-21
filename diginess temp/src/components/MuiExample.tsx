/** @jsxImportSource @emotion/react */
import React from 'react';
import styled from '@emotion/styled';
import { Button, Card, CardContent, Typography, Box, Container } from '@mui/material';
import { css } from '@emotion/react';

// Example: Emotion styled component
const StyledCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
`;

// Example: Emotion css prop
const titleStyles = css`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
`;

// Example: Material UI with Emotion
const StyledButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 12px 32px;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: scale(1.05);
  }
`;

export const MuiExample: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
          Material UI + Emotion Integration
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          This is an example demonstrating Material UI components styled with Emotion CSS-in-JS
        </Typography>
      </Box>

      {/* Emotion Styled Component */}
      <StyledCard>
        <CardContent>
          <Typography css={titleStyles}>
            Emotion Styled Component
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This card is styled using Emotion&apos;s styled() function with custom CSS.
          </Typography>
          <StyledButton variant="contained" size="large">
            Get Started
          </StyledButton>
        </CardContent>
      </StyledCard>

      {/* Material UI Components */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Material UI Styled Components
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            These buttons use Material UI with Emotion styling integration.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary">
              Primary Button
            </Button>
            <Button variant="outlined" color="primary">
              Outlined Button
            </Button>
            <Button variant="text" color="primary">
              Text Button
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Mixed Styling Approach */}
      <Card sx={{ backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Mixed Styling Approach
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'white',
              borderRadius: 1,
              border: '1px solid #e0e0e0',
              mb: 2,
            }}
          >
            <Typography variant="body2">
              You can mix Material UI&apos;s sx prop with Emotion styled components for maximum flexibility.
            </Typography>
          </Box>
          <StyledButton variant="contained" size="medium">
            Learn More
          </StyledButton>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MuiExample;
