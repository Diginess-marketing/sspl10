import { createTheme, responsiveFontSizes, PaletteColor, PaletteColorOptions } from '@mui/material/styles';
import { colors, typography, effects } from '@/theme/design-tokens';

// Create a theme instance.
let theme = createTheme({
    palette: {
        primary: {
            main: colors.brand.primary.main,
            light: colors.brand.primary.light,
            dark: colors.brand.primary.dark,
            contrastText: colors.brand.primary.contrastText,
        },
        secondary: {
            main: colors.brand.secondary.main,
            light: colors.brand.secondary.light,
            dark: colors.brand.secondary.dark,
            contrastText: colors.brand.secondary.contrastText,
        },
        brand: colors.brand, // Add the brand object to runtime palette
        info: {
            main: colors.brand.accent.main,
            light: colors.brand.accent.light,
            dark: colors.brand.accent.dark,
            contrastText: colors.brand.accent.contrastText,
        },
        success: {
            main: colors.brand.success.main,
            contrastText: colors.brand.success.contrastText,
        },
        background: {
            default: colors.background.default,
            paper: colors.background.paper,
        },
        text: {
            primary: colors.text.primary,
            secondary: colors.text.secondary,
            disabled: colors.text.disabled,
        },
    },
    typography: {
        fontFamily: typography.fontFamily.body,
        h1: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: typography.fontWeight.bold,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
        },
        h2: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: typography.fontWeight.bold,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
        },
        h3: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: typography.fontWeight.bold,
            textTransform: 'uppercase',
        },
        h4: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: typography.fontWeight.bold,
        },
        h5: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: typography.fontWeight.bold,
        },
        h6: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: typography.fontWeight.medium,
        },
        button: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: typography.fontWeight.bold,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
        },
    },
    shape: {
        borderRadius: 12, // 0.75rem
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    padding: '8px 19px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: effects.shadows.md,
                        transform: 'translateY(-2px)',
                    },
                },
                containedPrimary: {
                    background: colors.gradients.primary,
                },
                containedSecondary: {
                    background: colors.gradients.accent,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: effects.shadows.sm,
                },
                elevation2: {
                    boxShadow: effects.shadows.md,
                },
                elevation8: {
                    boxShadow: effects.shadows.lg,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid rgba(0,0,0,0.05)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: colors.brand.primary.main,
                    boxShadow: effects.shadows.md,
                },
            },
        },
    },
});

theme = responsiveFontSizes(theme);

export default theme;
