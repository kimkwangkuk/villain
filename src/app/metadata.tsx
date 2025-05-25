import type { Metadata } from "next";

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