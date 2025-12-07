"use server";

import { db } from "@/server/db";
import { user } from "@/server/db/schema";

export const shouldSetup = async () => {
  // check if theres user data in db
  const checkUser = await db
    .select({ id: user.id })
    .from(user)
    .limit(1)
    .execute();

  return checkUser.length <= 0;
};
