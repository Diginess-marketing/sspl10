import { Card, CardProps, styled } from '@mui/material';
import { effects } from '@/theme/design-tokens';

interface SportCardProps extends Omit<CardProps, 'variant'> {
    variant?: 'default' | 'glass' | 'glass-dark' | 'outlined';
}

const SportCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'variant',
})<SportCardProps>(({ theme, variant = 'default' }) => ({
    borderRadius: 16,
    transition: 'all 0.3s ease-in-out',
    overflow: 'hidden',

    ...(variant === 'default' && {
        background: theme.palette.background.paper,
        boxShadow: effects.shadows.sm,
        border: '1px solid rgba(0,0,0,0.05)',
    }),

    ...(variant === 'glass' && {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: effects.shadows.md,
    }),

    ...(variant === 'glass-dark' && {
        background: 'rgba(11, 19, 43, 0.8)', // Midnight Navy with opacity
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: theme.palette.common.white,
        // Fallback to md if lg is missing, or casting if we know it exists at runtime
        boxShadow: (effects.shadows as any).lg || effects.shadows.md,
    }),

    ...(variant === 'outlined' && {
        background: 'transparent',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
    }),

    '&:hover': {
        transform: 'translateY(-4px)',
        // Fallback to md if lg is missing
        boxShadow: (effects.shadows as any).lg || effects.shadows.md,
    },
}));

export default SportCard;
