"use server";

import { rm } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { javaInstance } from "@/server/db/schema";
import { getJdkFolder } from "../app/jdk";

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
    await rm(path.join(await getJdkFolder(), record.id), {
      recursive: true,
      force: true,
    });
  }

  revalidatePath("/java");
};
