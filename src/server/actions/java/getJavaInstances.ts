"use server";

import which from "which";
import { db } from "@/server/db";
import { $ } from "@/server/utils";

export const getSystemJava = async () => {
  const systemInstance = await which("java", { nothrow: true });
  if (!systemInstance) return;

  const output = await $(
    `${systemInstance} -XshowSettings:properties -version`,
  );
  const text = await output.text();
  const version = text
    .split("\n")
    .find((line) => line.includes("java.version"))
    ?.split("=")[1]
    .trim();

  return {
    path: systemInstance,
    version,
  };
};

export const getJavaInstances = async () => {
  return db.query.javaInstance.findMany().execute();
};
