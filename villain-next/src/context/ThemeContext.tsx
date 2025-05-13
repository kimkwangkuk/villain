'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme');
    
    // 시스템 테마 감지
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 저장된 테마가 있으면 그것을 사용하고, 없으면 시스템 테마를 따름
    const initialTheme = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDarkMode(initialTheme);
    
    // 초기 테마 적용
    if (initialTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      
      // DOM에 다크모드 클래스 적용
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // 로컬 스토리지에 테마 설정 저장
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}; 