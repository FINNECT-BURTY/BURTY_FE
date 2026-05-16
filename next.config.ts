import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 배포 이미지는 standalone 산출물로 뜬다.
   *
   * <p>Dockerfile 이 .next/standalone 을 복사해 node server.js 로 실행한다. 쓰이지 않는
   * 설정처럼 보여도 지우면 이미지가 뜨지 않는다.
   */
  output: "standalone",

  /**
   * 로컬 백엔드로 API 를 프록시한다.
   *
   * <p>{@code BURTY_API_PROXY_TARGET} 이 있을 때만 켠다. 브라우저에서 3200 → 8090 으로
   * 직접 부르면 크롬의 Private Network Access 정책이 loopback 접근을 막는다. 같은 출처로
   * 보내고 Next 가 서버에서 전달하면 그 제약을 받지 않는다.
   *
   * <p>운영에는 영향이 없다 — 환경변수가 없으면 규칙이 비어 있다.
   */
  async rewrites() {
    const target = process.env.BURTY_API_PROXY_TARGET;
    if (!target) return [];

    return [
      {
        source: "/api/v1/:path*",
        destination: `${target}/api/v1/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
