const backendOrigin = (process.env.BACKEND_API_ORIGIN || 'http://localhost:3001').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${backendOrigin}/api/v1/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
