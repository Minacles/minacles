"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { javaInstance } from "@/server/db/schema";
import { queryJavaInstance } from "./queryJavaInstance";

export const createUserInstance = async (name: string, path: string) => {
  const query = await queryJavaInstance(path);
  const out = await db
    .insert(javaInstance)
    .values({
      id: nanoid(),
      name,
      path,
      version: query.version ?? "Unknown",
      isManaged: false,
      isSystem: false,
    })
    .returning()
    .execute();

  revalidatePath("/java");

  return out[0];
};
