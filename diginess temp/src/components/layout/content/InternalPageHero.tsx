import React from 'react';
import { Box, Container, Typography, alpha, useTheme } from '@mui/material';

interface InternalPageHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    align?: 'center' | 'left';
}

export const InternalPageHero = ({
    title,
    subtitle,
    backgroundImage = '/BG-Ravimohan-16x10.webp',
    align = 'center'
}: InternalPageHeroProps) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: 'relative',
                bgcolor: 'brand.primary.main',
                color: 'white',
                py: { xs: 8, md: 12 },
                overflow: 'hidden'
            }}
        >
            {/* Background with Standard Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    opacity: 0.2
                }}
            >
                <img
                    src={backgroundImage}
                    alt="Background"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,19,43,0.8), rgba(11,19,43,0.95))' }} />
            </Box>

            {/* Decorative Top Accent */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.brand.accent.main}, ${theme.palette.secondary.main})`
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: align }}>
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                        textTransform: 'uppercase',
                        mb: 2,
                        textShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                >
                    {title}
                </Typography>

                {subtitle && (
                    <Typography
                        variant="h5"
                        sx={{
                            maxWidth: align === 'center' ? '800px' : '600px',
                            mx: align === 'center' ? 'auto' : 0,
                            color: 'grey.300',
                            fontWeight: 400
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Container>
        </Box>
    );
};
