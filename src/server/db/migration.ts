import { migrate } from "drizzle-orm/libsql/migrator";
import { logger } from "@/lib/logger";

export const migrateDatabase = async () => {
  const { db } = await import(".");

  await migrate(db, { migrationsFolder: "drizzle" }).then(() =>
    logger.success("Database migrated successfully"),
  );
};
