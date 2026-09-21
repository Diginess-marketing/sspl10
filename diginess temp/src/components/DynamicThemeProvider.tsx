import { useEffect } from 'react';
import { useWebsiteContent } from '@/hooks/useWebsiteContent';

const DynamicThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useWebsiteContent();

  useEffect(() => {
    if (theme?.colors) {
      const colors = theme.colors as Record<string, string>;
      const root = document.documentElement;

      // Apply theme colors to CSS variables
      Object.entries(colors).forEach(([key, value]) => {
        const cssVariable = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVariable}`, value);
      });
    }
  }, [theme]);

  return <>{children}</>;
};

export default DynamicThemeProvider;