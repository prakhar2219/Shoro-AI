/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', '127.0.0.1'], // Add domains for blog images
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  // Configure webpack to handle large strings more efficiently
  webpack: (config, { isServer }) => {
    // Optimize webpack cache for better performance with large strings
    config.cache = {
      ...config.cache,
      compression: 'gzip', // Compress cache files
    };
    
    // Optimize module concatenation
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };
    
    // Suppress the PackFileCacheStrategy warning by optimizing cache strategy
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules/,
        message: /PackFileCacheStrategy/,
      },
    ];
    
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'}/:path*`, // Proxy to backend API
      },
    ];
  },
}

export default nextConfig
