import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.5", "192.168.0.*", "localhost:3000"],
};

export default nextConfig;
