"use server";

import { type FileHandle, mkdir, open, rm } from "node:fs/promises";
import path from "node:path";
import { config } from "@/lib/config";

export const createTemporaryFolder = async () => {
  const filesPath = config("files.directory")!;
  const tempFolder = path.join(filesPath, ".temp");

  await mkdir(tempFolder, { recursive: true });

  return tempFolder;
};

export const getTemporaryFile = async (name: string) => {
  const tempFolder = await createTemporaryFolder();
  const filePath = path.join(tempFolder, name);

  return filePath;
};

export const openTemporaryFile = async (name: string) => {
  const filePath = await getTemporaryFile(name);
  const handle = await open(filePath, "w+");

  return handle;
};

export const deleteTemporaryFolder = async () => {
  const tempFolder = await createTemporaryFolder();
  await rm(tempFolder, { recursive: true, force: true });
};
