'use client';

import type { Metadata } from "next";
import "./globals.css";
// import { Inter } from 'next/font/google';
// import { Noto_Sans_KR } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import ClientLayout from '@/components/ClientLayout';

// const inter = Inter({ subsets: ['latin'] });
// const notoSansKr = Noto_Sans_KR({ 
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-pretendard', // 이전에 정의한 변수명 유지
// });

// metadata는 서버 컴포넌트에서만 사용할 수 있어서 여기서는 제거
// export const metadata: Metadata = {...}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          html {
            font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
          }
        `}} />
      </head>
      <body>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <ClientLayout>
            {children}
            </ClientLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
