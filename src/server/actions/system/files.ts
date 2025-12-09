"use server";

import { createHash } from "node:crypto";
import type { FileHandle } from "node:fs/promises";

export const writeStreamToFile = async (
  reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
  file: FileHandle,
) => {
  const checksumer = createHash("sha256");

  return new Promise<string>((resolve, reject) => {
    const processChunk = async () => {
      try {
        const { done, value } = await reader.read();

        if (done) {
          resolve(checksumer.digest("hex"));
          return;
        }

        checksumer.update(value);
        await file.write(value);

        setImmediate(processChunk);
      } catch (error) {
        reject(error);
      }
    };

    processChunk();
  });
};
