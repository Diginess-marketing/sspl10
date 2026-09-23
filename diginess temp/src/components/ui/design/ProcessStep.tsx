import { Box, Typography, alpha, useTheme } from '@mui/material';
import { LucideIcon } from 'lucide-react';

interface ProcessStepProps {
    stepNumber: number;
    title: string;
    description: string;
    icon?: LucideIcon;
    last?: boolean;
}

export const ProcessStep = ({ stepNumber, title, description, icon: Icon, last = false }: ProcessStepProps) => {
    const theme = useTheme();

    return (
        <Box sx={{ position: 'relative', display: 'flex', gap: 3, pb: last ? 0 : 5 }}>
            {/* Connector Line */}
            {!last && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 48,
                        left: 24,
                        bottom: 0,
                        width: '2px',
                        bgcolor: alpha(theme.palette.brand.primary.main, 0.1),
                        zIndex: 0,
                    }}
                />
            )}

            {/* Step Marker */}
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'brand.primary.main',
                    color: 'brand.accent.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    zIndex: 1,
                    boxShadow: theme.shadows[2],
                }}
            >
                {Icon ? <Icon size={24} /> : stepNumber}
            </Box>

            {/* Content */}
            <Box sx={{ pt: 1 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {description}
                </Typography>
            </Box>
        </Box>
    );
};
