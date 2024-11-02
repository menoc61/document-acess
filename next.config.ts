import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BOT_TOKEN: process.env.BOT_TOKEN,
    CHAT_ID: process.env.CHAT_ID,
  },
};

export default nextConfig;
