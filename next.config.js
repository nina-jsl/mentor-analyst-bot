/** @type {import('next').NextConfig} */
module.exports = {
  turbopack: {},         // disables turbopack strict check
  webpack: (config) => { // forces webpack usage
    return config;
  },
};
