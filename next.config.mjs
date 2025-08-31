import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    const target = process.env.BACKEND_BASE_URL?.replace(/\/$/, '');
    if (!target) return [];
    // Proxy only backend routes; keep NextAuth (/api/auth) handled by Next
    return [
      { source: '/api/health', destination: `${target}/health` },
      { source: '/api/user/:path*', destination: `${target}/user/:path*` },
      {
        source: '/api/student/:path*',
        destination: `${target}/student/:path*`,
      },
      { source: '/api/sessions', destination: `${target}/sessions` },
      { source: '/api/payments', destination: `${target}/payments` },
      { source: '/api/holiday', destination: `${target}/holiday` },
    ];
  },
};

export default nextConfig;
