'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={() => reset()}
      >
        다시 시도하기
      </button>
    </div>
  );
} 