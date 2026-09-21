/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Advanced Emotion styled components with pseudo-selectors and animations
const AnimatedCard = styled(Card)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
`;

const PulseAnimation = styled.div`
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const FloatingButton = styled(Button)`
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:active::after {
    width: 300px;
    height: 300px;
  }
`;

const dynamicCardStyles = (isHovered: boolean) => css`
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'};
  box-shadow: ${isHovered
    ? '0 20px 40px rgba(102, 126, 234, 0.3)'
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
`;

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    id: 1,
    title: 'Advanced Styling',
    description: 'Combine Emotion and Material UI for powerful styling capabilities',
    icon: <StarIcon />,
  },
  {
    id: 2,
    title: 'Animations',
    description: 'Smooth, performant animations with CSS-in-JS',
    icon: <StarIcon />,
  },
  {
    id: 3,
    title: 'Responsive',
    description: 'Mobile-first responsive design patterns',
    icon: <StarIcon />,
  },
];

/**
 * Advanced Material UI + Emotion Component Example
 * Demonstrates:
 * - Complex styled components with pseudo-selectors
 * - CSS animations and transitions
 * - State-driven styling
 * - Icon integration
 * - Grid layouts
 */
export const AdvancedMuiEmotionExample: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
          Advanced <GradientText>Material UI + Emotion</GradientText> Examples
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}>
          Explore advanced styling patterns, animations, and responsive design techniques
        </Typography>
      </Box>

      {/* Feature Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.id}>
            <div
              css={dynamicCardStyles(hoveredId === feature.id)}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <AnimatedCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: '#667eea', mr: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </div>
          </Grid>
        ))}
      </Grid>

      {/* Animations Demo */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Pulse Animation
            </Typography>
            <PulseAnimation>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2">This box pulses continuously</Typography>
              </Box>
            </PulseAnimation>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Ripple Button
            </Typography>
            <FloatingButton variant="contained" color="primary" fullWidth>
              Click for Ripple Effect
            </FloatingButton>
          </Card>
        </Grid>
      </Grid>

      {/* Form Demo */}
      <Card sx={{ p: 4, mb: 6 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Contact Form with Emotion Styling
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
            {submitted && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: 1,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: '20px' }} />
                <Typography variant="body2">Email submitted successfully!</Typography>
              </Box>
            )}
            <FloatingButton type="submit" variant="contained" color="primary">
              Subscribe
            </FloatingButton>
          </Stack>
        </form>
      </Card>

      {/* Tag/Chip Demo */}
      <Card sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Popular Tags
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {[
            'React',
            'Material UI',
            'Emotion',
            'Vite',
            'TypeScript',
            'CSS-in-JS',
            'Styling',
          ].map((tag) => (
            <Chip
              key={tag}
              label={tag}
              variant="outlined"
              color="primary"
              sx={{
                backgroundColor: '#f0f0f0',
                '&:hover': {
                  backgroundColor: '#667eea',
                  color: 'white',
                },
              }}
            />
          ))}
        </Stack>
      </Card>
    </Box>
  );
};

export default AdvancedMuiEmotionExample;
