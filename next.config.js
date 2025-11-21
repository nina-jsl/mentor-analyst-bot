/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false,
    serverComponentsExternalPackages: [],
  },
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
