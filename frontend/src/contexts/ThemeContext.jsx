import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'auto'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'auto';
  });

  // Determine actual theme based on user preference and system preference
  const [actualTheme, setActualTheme] = useState('dark');

  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setActualTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setActualTheme(theme);
      }
    };

    updateActualTheme();

    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateActualTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Theme colors
  const themes = {
    light: {
      '--primary-color': '#0ea5e9',
      '--secondary-color': '#f5f7fa',
      '--text-color': '#0f172a',
      '--subtle-text-color': '#64748b',
      '--background-color': '#f8fafc',
      '--input-background': '#f1f5f9',
      '--border-color': '#e2e8f0',
      '--success-color': '#06b6d4',
      '--warning-color': '#f59e0b',
      '--error-color': '#ef4444',
      '--table-row-hover-bg': '#f0f4f8',
      '--table-row-hover-border': '#cbd5e1',
      '--table-header-bg': '#f5f7fa',
      '--card-background': '#ffffff',
      '--hover-background': '#e2e8f0',
      '--hover-border': '#cbd5e1',
      '--button-hover-bg': '#0284c7',
      '--input-hover-border': '#0ea5e9',
      '--color-primary-hover': '#0284c7',
    },
    dark: {
      '--primary-color': '#1173d4',
      '--secondary-color': '#1e293b',
      '--text-color': '#ffffff',
      '--subtle-text-color': '#94a3b8',
      '--background-color': '#000000',
      '--input-background': '#1e293b',
      '--border-color': '#334155',
      '--success-color': '#22c55e',
      '--warning-color': '#f59e0b',
      '--error-color': '#ef4444',
      '--table-row-hover-bg': '#1e293b',
      '--table-row-hover-border': '#334155',
      '--table-header-bg': '#1a2332',
      '--card-background': '#1a2332',
      '--hover-background': '#334155',
      '--hover-border': '#475569',
      '--button-hover-bg': '#1d4ed8',
      '--input-hover-border': '#1173d4',
      '--color-primary-hover': '#1d4ed8',
    }
  };

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = themes[actualTheme];

    Object.entries(themeColors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Set data attribute for additional styling
    root.setAttribute('data-theme', actualTheme);
  }, [actualTheme]);

  const value = {
    theme,
    actualTheme,
    changeTheme,
    themes: themes[actualTheme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};