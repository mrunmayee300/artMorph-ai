import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const isDockerBuild = process.env.DOCKER_BUILD === "1";

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  ...(isDockerBuild
    ? {
        output: "standalone" as const,
        outputFileTracingExcludes: {
          "*": ["./storage/**"],
        },
      }
    : {}),
  serverExternalPackages: [
    "sharp",
    "@aws-sdk/client-s3",
    "@prisma/client",
    "prisma",
  ],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
    unoptimized: process.env.STORAGE_DRIVER !== "r2",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
