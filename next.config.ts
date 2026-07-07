import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: {
    compilationMode: "annotation",
  },
  skipTrailingSlashRedirect: true,
  typedRoutes: true,
};

export default nextConfig;
