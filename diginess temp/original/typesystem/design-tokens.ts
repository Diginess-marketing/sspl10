
export const colors = {
    brand: {
        primary: {
            main: '#0A1628', // Deep Navy
            light: '#1A2D4A', // Primary Light
            dark: '#050D1A',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#00B4D8', // Electric Blue
            light: '#48CAE4', // Bright Cyan / CTA Hover
            dark: '#0077B6', // Gradient end
            contrastText: '#FFFFFF',
        },
        accent: {
            main: '#F5A623', // Vibrant Gold
            light: '#F8C874',
            dark: '#C7851A',
            contrastText: '#0A1628',
        },
        success: {
            main: '#10B981', // Emerald
            contrastText: '#FFFFFF',
        },
    },
    background: {
        default: '#0B0E17', // Canvas
        paper: '#0F1423', // Depth / Card
        glass: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
        primary: '#FFFFFF',
        secondary: '#94A3B8', // Light Gray
        disabled: '#64748B', // Muted Slate
    },
    gradients: {
        primary: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
        accent: 'linear-gradient(135deg, #F5A623 0%, #F8C874 100%)',
        hero: 'linear-gradient(135deg, #0B0E17 0%, #1A2D4A 50%, #0B0E17 100%)',
    },
};

export const typography = {
    fontFamily: {
        body: '"Outfit", system-ui, sans-serif',
        heading: '"Rajdhani", system-ui, sans-serif',
        display: '"Rajdhani", system-ui, sans-serif',
    },
    fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
};

export const effects = {
    shadows: {
        sm: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        md: '0 8px 16px -4px rgba(0, 0, 0, 0.15), 0 4px 8px -4px rgba(0, 0, 0, 0.1)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(91, 192, 190, 0.4)', // Accent glow
    },
};
