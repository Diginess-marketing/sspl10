import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    align?: 'center' | 'left';
    dark?: boolean;
}

export const SectionHeader = ({ title, subtitle, align = 'center', dark = false }: SectionHeaderProps) => {
    const theme = useTheme();

    return (
        <Box sx={{ mb: 6, textAlign: align }}>
            <Typography
                variant="h2"
                sx={{
                    color: dark ? 'white' : 'text.primary',
                    textTransform: 'uppercase',
                    position: 'relative',
                    display: 'inline-block',
                    mb: 2,
                    '&::after': {
                        content: '""',
                        display: 'block',
                        width: '60px',
                        height: '4px',
                        bgcolor: 'brand.accent.main',
                        mt: 1,
                        mx: align === 'center' ? 'auto' : 0
                    }
                }}
            >
                {title}
            </Typography>

            {subtitle && (
                <Typography
                    variant="body1"
                    sx={{
                        color: dark ? 'grey.400' : 'text.secondary',
                        maxWidth: '700px',
                        mx: align === 'center' ? 'auto' : 0,
                        fontSize: '1rem'
                    }}
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};
