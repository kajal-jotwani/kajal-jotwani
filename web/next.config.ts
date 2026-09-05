import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the counter API validates slugs by reading content/life/ at request time —
  // make sure those files ship inside the serverless function
  outputFileTracingIncludes: {
    "/api/life/[slug]": ["./content/**/*"],
  },
};

export default nextConfig;
