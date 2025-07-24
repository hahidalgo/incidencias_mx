import type { NextConfig } from 'next';

import initializeBundleAnalyzer from '@next/bundle-analyzer';

// https://www.npmjs.com/package/@next/bundle-analyzer
const withBundleAnalyzer = initializeBundleAnalyzer({
    enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true'
});

// https://nextjs.org/docs/pages/api-reference/next-config-js
const nextConfig: NextConfig = {
    outputFileTracingIncludes: {
        "/*": ["./registry/**/*"],
      },
      images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "avatars.githubusercontent.com",
          },
          {
            protocol: "https",
            hostname: "images.unsplash.com",
          },
        ],
      },
      experimental: {},
      // https://nextjs.org/docs/app/api-reference/next-config-js/serverExternalPackages
      serverExternalPackages: ['@prisma/client', 'bcryptjs']
};

export default withBundleAnalyzer(nextConfig);
