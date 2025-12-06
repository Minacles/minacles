import { migrate } from "drizzle-orm/libsql/migrator";
import { logger } from "@/lib/logger";
import { db } from ".";

export const migrateDatabase = async () => {
  await migrate(db, { migrationsFolder: "drizzle" }).then(() =>
    logger.success("Database migrated successfully"),
  );
};
