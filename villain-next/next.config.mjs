/** @type {import('next').NextConfig} */
const nextConfig = {
  // 기존 설정 유지
  reactStrictMode: true,
  // 경로 별칭 추가
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  // 서버 측 렌더링 시 브라우저 API 오류 방지
  experimental: {
    esmExternals: 'loose'
  },
  // 빌드 시 ESLint 오류 무시
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig; 