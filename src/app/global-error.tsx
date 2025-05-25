'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">예상치 못한 오류가 발생했습니다</h2>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => reset()}
          >
            다시 시도하기
          </button>
        </div>
      </body>
    </html>
  );
} 