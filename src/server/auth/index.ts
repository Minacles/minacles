import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { config } from "@/lib/config";
import { db } from "../db";

export const auth = betterAuth({
  secret: config("app.secretKey"),
  baseURL: config("app.url"),
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
