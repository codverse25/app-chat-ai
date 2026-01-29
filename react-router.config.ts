import type { Config } from "@react-router/dev/config";

export default {
  // Enable SSR by default for local development (npm run start works)
  // Disable SSR for Vercel deployment (set via environment variable)
  ssr: process.env.VERCEL_ENV ? false : true,
} satisfies Config;
