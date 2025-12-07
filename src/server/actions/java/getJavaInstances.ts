"use server";

import which from "which";
import { db } from "@/server/db";
import { queryJavaInstance } from "./queryJavaInstance";

export const getSystemJava = async () => {
  const systemInstance = await which("java", { nothrow: true });
  if (!systemInstance) return;

  const query = await queryJavaInstance(systemInstance);

  return {
    ...query,
    path: systemInstance,
  };
};

export const getJavaInstances = async () => {
  return db.query.javaInstance.findMany().execute();
};
