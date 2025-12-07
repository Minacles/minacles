import { drizzle } from "drizzle-orm/libsql";
import { config } from "@/lib/config";
import * as schema from "./schema";

export const db = drizzle(config("database.file")!, { schema });
