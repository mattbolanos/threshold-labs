import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async redirects() {
    return [
      {
        destination: "/lab/lab-notes/:path*",
        permanent: true,
        source: "/lab-notes/:path*",
      },
      {
        destination: "/lab/training/:path*",
        permanent: true,
        source: "/training/:path*",
      },
      {
        destination: "/lab/admin/:path*",
        permanent: true,
        source: "/admin/:path*",
      },
      {
        destination: "/lab/lab-notes/:path*",
        permanent: true,
        source: "/notes/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  typedRoutes: true,
};

export default nextConfig;
