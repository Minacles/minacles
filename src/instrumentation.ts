import "@/lib/config";
import { migrateDatabase } from "./server/db/migration";
import { createWebSocketServer } from "./server/ws";

export const register = async () => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await migrateDatabase();

    createWebSocketServer({ port: 6001 });
  }
};
