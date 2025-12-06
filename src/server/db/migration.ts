import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from ".";

export const migrateDatabase = async () => {
  await migrate(db, { migrationsFolder: "drizzle" }).then(() =>
    console.log("Database migrated successfully"),
  );
};
