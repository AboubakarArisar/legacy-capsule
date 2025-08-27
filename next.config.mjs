/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable experimental features for better stability
  },
  // Ensure proper static generation
  output: "standalone",
  // Disable image optimization if not needed
  images: {
    unoptimized: true,
  },
  // Ensure proper webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
