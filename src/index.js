import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 다크모드 배경색 전역 적용을 위한 스타일 추가
const style = document.createElement('style');
style.textContent = `
  /* 다크모드 배경색 확실히 적용 */
  @media (prefers-color-scheme: dark) {
    .dark body, .dark .bg-white {
      background-color: #000 !important;
    }
    .dark .bg-gray-100, .dark .bg-gray-200 {
      background-color: #111 !important;
    }
  }
  /* 다크모드가 명시적으로 설정된 경우 */
  html.dark body, html.dark .bg-white {
    background-color: #000 !important;
  }
  html.dark .bg-gray-100, html.dark .bg-gray-200 {
    background-color: #111 !important;
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
