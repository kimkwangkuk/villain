'use client';

import React from 'react';

export default function FontStyleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <style jsx global>{`
        html {
          font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
        }
      `}</style>
    </>
  );
} 