"use server";

import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { auth } from "@/server/auth";

export const getSession = async (headers: ReadonlyHeaders) => {
  const session = await auth.api.getSession({ headers });

  return session;
};
