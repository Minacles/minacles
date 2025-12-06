import { drizzle } from "drizzle-orm/libsql";
import { config } from "@/lib/config";

export const db = drizzle(config("database.file")!);
