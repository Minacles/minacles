import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/server/db";
import { javaInstance } from "@/server/db/schema";
import { getSystemJava } from "./getJavaInstances";

export const syncSystemJava = async () => {
  const systemJava = await getSystemJava();
  if (!systemJava) return;

  const existing = await db.query.javaInstance
    .findFirst({
      where: (instances, { eq }) => eq(instances.isSystem, true),
    })
    .execute();

  if (existing) {
    await db
      .update(javaInstance)
      .set({
        path: systemJava.path,
        version: systemJava.version,
      })
      .where(eq(javaInstance.id, existing.id))
      .execute();
  } else {
    await db
      .insert(javaInstance)
      .values({
        id: nanoid(),
        name: "System Java",
        path: systemJava.path,
        version: systemJava.version ?? "Unknown",
        isSystem: true,
        isManaged: false,
      })
      .execute();
  }
};
