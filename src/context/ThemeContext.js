import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 로컬 스토리지에서 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme');
    // 시스템 설정 확인
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  useEffect(() => {
    // dark 클래스 토글
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // 로컬 스토리지에 테마 설정 저장
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 