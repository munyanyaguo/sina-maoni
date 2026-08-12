/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TypeScript source and must be compiled by Next.
  transpilePackages: ["@sina-maoni/ui", "@sina-maoni/core"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
