import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'pptxgenjs', 'better-sqlite3'],
  turbopack: {},  // dev 모드 Turbopack 명시적 활성화
  webpack: (config, { isServer }) => {
    if (isServer) {
      // leaflet은 브라우저 전용 라이브러리 - 서버 번들에서 제외 (production build용)
      config.externals = [...(config.externals ?? []), 'leaflet'];
    }
    return config;
  },
};

export default nextConfig;
