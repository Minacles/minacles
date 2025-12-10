import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { extract as extractTar } from "tar";
import { Extract as ExtractZip } from "unzip-stream";

export const extractZip = async (archivePath: string, destination: string) => {
  return new Promise<void>((resolve, reject) => {
    const read = createReadStream(archivePath);

    read
      .pipe(ExtractZip({ path: destination }))
      .once("finish", resolve)
      .once("error", reject);
  });
};

export const extractTarGz = async (
  archivePath: string,
  destination: string,
) => {
  return new Promise<void>((resolve, reject) => {
    const read = createReadStream(archivePath);

    read
      .pipe(createGunzip())
      .pipe(extractTar({ cwd: destination }))
      .once("finish", resolve)
      .once("error", reject);
  });
};

export const extractArchive = async (
  archivePath: string,
  destination: string,
) => {
  if (archivePath.endsWith(".zip")) {
    return await extractZip(archivePath, destination);
  }

  if (archivePath.endsWith(".tar.gz")) {
    return await extractTarGz(archivePath, destination);
  }

  throw new Error("Unsupported archive format");
};
