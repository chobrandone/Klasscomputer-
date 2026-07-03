/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'klasscomputer.cm' },
      { protocol: 'https', hostname: '**.up.railway.app' },
      { protocol: 'https', hostname: '**.onrender.com' },
    ],
  },
  async rewrites() {
    // On Vercel, set API_PROXY_URL to the backend's public URL and
    // NEXT_PUBLIC_API_URL to "/api" — the browser then talks same-origin,
    // which keeps the HttpOnly auth cookies working without SameSite=None.
    const target = process.env.API_PROXY_URL;
    if (!target) return [];
    return [{ source: '/api/:path*', destination: `${target}/:path*` }];
  },
};

export default nextConfig;
