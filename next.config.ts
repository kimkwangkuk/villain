import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 환경변수 설정
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyAdmo8SKrrkDocCXGIE_eOo4QxWMxA0is8",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "villain-5f05a.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "villain-5f05a",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "villain-5f05a.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "579679958637",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:579679958637:web:38705cebd28d47fc803164",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-0MLWMN815Q",
  },
  // 경로 별칭 추가
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  // 빌드 시 ESLint 오류 무시
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
