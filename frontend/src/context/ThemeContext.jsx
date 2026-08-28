import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeMode] = useState('dark');
  const [effectiveTheme] = useState('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode: 'dark', setThemeMode: () => {}, effectiveTheme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
