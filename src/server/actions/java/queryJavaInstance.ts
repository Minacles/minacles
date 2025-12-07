"use server";

import { $ } from "@/server/utils/shell";

export const queryJavaInstance = async (executable: string) => {
  const output =
    await $`${executable} -XshowSettings:properties -version`.combined();
  const version = output
    .split("\n")
    .find((line) => line.includes("java.version"))
    ?.split("=")[1]
    .trim();

  return {
    version,
  };
};
