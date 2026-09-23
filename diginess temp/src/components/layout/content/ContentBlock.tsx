import React from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { SectionHeader } from '@/components/ui/design/SectionHeader';

interface ContentBlockProps {
    title?: string;
    subtitle?: string;
    content: string | React.ReactNode;
    image?: string;
    imagePosition?: 'left' | 'right';
    alt?: string;
    background?: 'white' | 'gray' | 'dark';
}

export const ContentBlock = ({
    title,
    subtitle,
    content,
    image,
    imagePosition = 'right',
    alt = 'Section Image',
    background = 'white',
}: ContentBlockProps) => {
    const theme = useTheme();

    const getBgColor = () => {
        switch (background) {
            case 'gray': return 'grey.50';
            case 'dark': return 'brand.primary.main';
            default: return 'background.paper';
        }
    };

    const isDark = background === 'dark';

    return (
        <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: getBgColor() }}>
            <Container maxWidth="lg">
                {title && !image && (
                    <SectionHeader title={title} subtitle={subtitle} dark={isDark} />
                )}

                <Grid container spacing={6} alignItems="center">
                    {/* Image - Left Position */}
                    {image && imagePosition === 'left' && (
                        <Grid item xs={12} md={6}>
                            <Box
                                component="img"
                                src={image}
                                alt={alt}
                                sx={{
                                    width: '100%',
                                    borderRadius: 4,
                                    boxShadow: theme.shadows[4],
                                }}
                            />
                        </Grid>
                    )}

                    {/* Text Content */}
                    <Grid item xs={12} md={image ? 6 : 12}>
                        {/* Header here if using side-by-side layout */}
                        {title && image && (
                            <Box mb={3}>
                                <Typography
                                    variant="h3"
                                    color={isDark ? 'white' : 'text.primary'}
                                    sx={{ textTransform: 'uppercase', mb: 1 }}
                                >
                                    {title}
                                </Typography>
                                {subtitle && (
                                    <Typography variant="h6" color={isDark ? 'brand.accent.main' : 'text.secondary'}>
                                        {subtitle}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        <Typography variant="body1" color={isDark ? 'grey.300' : 'text.secondary'} sx={{ lineHeight: 1.8 }}>
                            {content}
                        </Typography>
                    </Grid>

                    {/* Image - Right Position */}
                    {image && imagePosition === 'right' && (
                        <Grid item xs={12} md={6}>
                            <Box
                                component="img"
                                src={image}
                                alt={alt}
                                sx={{
                                    width: '100%',
                                    borderRadius: 4,
                                    boxShadow: theme.shadows[4],
                                }}
                            />
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};
