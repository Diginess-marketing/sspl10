
import { PaletteColor, PaletteColorOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        brand: {
            primary: PaletteColor;
            secondary: PaletteColor;
            accent: PaletteColor;
            success: PaletteColor;
        };
    }
    interface PaletteOptions {
        brand?: {
            primary?: PaletteColorOptions;
            secondary?: PaletteColorOptions;
            accent?: PaletteColorOptions;
            success?: PaletteColorOptions;
        };
    }
}
