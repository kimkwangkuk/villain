'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 클라이언트 사이드 렌더링을 확인
  useEffect(() => {
    setIsClient(true);
    console.log('로그인 페이지 마운트됨');
  }, []);

  // 간단한 에러 핸들링
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <h2 className="text-lg font-semibold mb-2">오류가 발생했습니다</h2>
          <p>{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {isClient ? (
        <LoginForm className="w-full max-w-3xl" />
      ) : (
        <div className="animate-pulse flex space-x-4">
          <div className="w-full max-w-3xl h-[600px] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      )}
    </div>
  );
} 