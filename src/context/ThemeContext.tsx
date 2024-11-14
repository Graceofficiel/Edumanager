import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeConfig } from '../types';

const defaultTheme: ThemeConfig = {
  primaryColor: 'indigo',
  secondaryColor: 'blue',
  isDark: false,
};

const ThemeContext = createContext<{
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
}>({
  theme: defaultTheme,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
    document.documentElement.classList.toggle('dark', theme.isDark);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);