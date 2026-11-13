import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production verification separate from an already-running dev server.
  distDir: process.env.PULSEDECK_BUILD_DIR || '.next',
  experimental: {
    useTypeScriptCli: false,
    workerThreads: true,
    webpackBuildWorker: false,
    cpus: 1,
  },
};

export default nextConfig;
