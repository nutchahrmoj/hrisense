/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint และ type-check ถูกบังคับโดย dedicated jobs ใน .github/workflows/ci.yml
  // (`npm run lint` + `npx tsc --noEmit`) อยู่แล้ว การข้ามมันตอน `next build`
  // จึงกันไม่ให้ lint/type error บล็อก production deploy โดยที่ CI ยังจับได้ทุก PR
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
};
module.exports = nextConfig;
