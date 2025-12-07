"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { javaInstance } from "@/server/db/schema";

export const deleteJavaInstance = async (instanceId: string) => {
  const record = await db.query.javaInstance.findFirst({
    where: (javaInstance, { eq }) => eq(javaInstance.id, instanceId),
  });

  if (!record) {
    throw new Error("Java instance not found");
  }

  if (record.isSystem) {
    throw new Error("Cannot delete system Java instance");
  }

  void (await db
    .delete(javaInstance)
    .where(eq(javaInstance.id, instanceId))
    .execute());

  if (record.isManaged) {
    // TODO: clean up managed Java instance files
  }

  revalidatePath("/java");
};
