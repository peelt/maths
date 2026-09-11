import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the auth verification script build into its own directory rather than
  // clobbering the normal build. NEXT_PUBLIC_* values are inlined at build
  // time, so verifying the signed-out redirect needs a separate build with
  // Supabase credentials present.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};

export default nextConfig;
