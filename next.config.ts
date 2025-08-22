import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react', 'recharts', 'react-aria-components', '@internationalized/date'],
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'recharts', 
      '@radix-ui/react-icons',
      'react-aria-components',
      '@internationalized/date',
      'date-fns'
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    // Optimize React Aria bundle splitting
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups.reactAria = {
        name: 'react-aria',
        test: /[\\/]node_modules[\\/](react-aria-components|@internationalized)[\\/]/,
        chunks: 'all',
        priority: 30,
      };
    }
    return config;
  },
};

export default nextConfig;
