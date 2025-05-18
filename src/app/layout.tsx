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

export const metadata: Metadata = {
  title: "빌런 - 직장 내 문제 상황 공유 플랫폼",
  description: "직장 내 문제 상황을 공유하고 해결책을 모색하는 커뮤니티입니다.",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ]
  },
  openGraph: {
    title: "빌런 - 직장 내 문제 상황 공유 플랫폼",
    description: "직장 내 문제 상황을 공유하고 해결책을 모색하는 커뮤니티입니다.",
    images: [
      {
        url: '/images/img_social_villain.png',
        width: 1200,
        height: 630,
        alt: '빌런 - 익명 커뮤니티'
      }
    ],
    type: "website",
    siteName: "빌런",
  },
  twitter: {
    card: 'summary_large_image',
    title: '빌런 - 직장 내 문제 상황 공유 플랫폼',
    description: '직장 내 문제 상황을 공유하고 해결책을 모색하는 커뮤니티입니다.',
    images: ['/images/img_social_villain.png']
  }
};

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
      </head>
      <body>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <ClientLayout>
            {children}
            </ClientLayout>
          </AuthProvider>
        </ThemeProvider>
        <style jsx global>{`
          html {
            font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
          }
        `}</style>
      </body>
    </html>
  );
}
