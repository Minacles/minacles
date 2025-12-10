"use server";

import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { config } from "@/lib/config";

export const getJdkFolder = async () => {
  const filesPath = config("files.directory")!;
  const tempFolder = path.join(filesPath, "jdk");

  if (
    !(await access(tempFolder)
      .then(() => true)
      .catch(() => false))
  ) {
    await mkdir(tempFolder, { recursive: true });
  }

  return tempFolder;
};
