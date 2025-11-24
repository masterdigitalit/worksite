/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {  images: {
    domains: ['localhost', '127.0.0.1', '31.129.96.163'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '31.129.96.163',
        port: '9000',
        pathname: '/photos/**',
      },
    ],
  },};

export default config;


