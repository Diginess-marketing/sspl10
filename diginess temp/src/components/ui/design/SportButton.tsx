import { Button, ButtonProps, styled } from '@mui/material';

interface SportButtonProps extends ButtonProps {
    glow?: boolean;
    component?: React.ElementType;
    to?: string;
}

const SportButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'glow',
})<SportButtonProps>(({ theme, glow, color = 'primary' }) => ({
    position: 'relative',
    overflow: 'hidden',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    borderRadius: '8px',
    transition: 'all 0.3s ease',

    // Dynamic glow effect based on prop
    ...(glow && {
        boxShadow: `0 0 15px ${color === 'secondary' ? theme.palette.secondary.main : theme.palette.primary.main
            }66`, // 40% opacity hex
        '&:hover': {
            boxShadow: `0 0 25px ${color === 'secondary' ? theme.palette.secondary.main : theme.palette.primary.main
                }99`,
            transform: 'translateY(-2px)',
        },
    }),

    // Add a subtle shine animation on hover
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease',
    },

    '&:hover::after': {
        left: '100%',
    },
}));

export default SportButton;
