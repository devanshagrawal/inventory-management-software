import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server output for the Electron shell to spawn as a
  // child process — see electron/main.ts.
  output: "standalone",
};

export default nextConfig;
