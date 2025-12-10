"use server";

import { cp, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { getQueryParams } from "@/lib/utils";
import { db } from "@/server/db";
import { javaInstance } from "@/server/db/schema";
import { extractArchive } from "@/server/utils/archive";
import { getSystemArch, getSystemOperatingSystem } from "@/server/utils/system";
import { getJdkFolder } from "../app/jdk";
import { findJreHome } from "../java/findJreHome";
import { getJavaReleaseVersion } from "../java/getJavaReleaseVersion";
import { writeStreamToFile } from "../system/files";
import {
  deleteTemporaryFolder,
  getTemporaryFolder,
  openTemporaryFile,
} from "../system/temporaryFiles";

type AdoptiumAsset = {
  checksum: string;
  checksum_link: string;
  download_count: number;
  link: string;
  metadata_link: string;
  name: string;
  signature_link: string;
  size: number;
};

type AdoptiumBinary = {
  architecture: string;
  download_count: number;
  heap_size: string;
  image_type: string;
  installer?: AdoptiumAsset;
  jvm_impl: string;
  os: string;
  package: AdoptiumAsset;
  project: string;
  scm_ref: string;
  updated_at: string;
};

type AdoptiumReleaseNotes = {
  link: string;
  name: string;
  size: number;
};

type AdoptiumSource = {
  link: string;
  name: string;
  size: number;
};

type AdoptiumVersionData = {
  build: number;
  major: number;
  minor: number;
  openjdk_version: string;
  optional?: string;
  security: number;
  semver: string;
};

type AdoptiumRelease = {
  aqavit_results_link: string;
  binaries: AdoptiumBinary[];
  download_count: number;
  id: string;
  release_link: string;
  release_name: string;
  release_notes: AdoptiumReleaseNotes;
  release_type: string;
  source: AdoptiumSource;
  timestamp: string;
  updated_at: string;
  vendor: string;
  version_data: AdoptiumVersionData;
};

export const installAdoptiumRelease = async (release: string) => {
  logger.start(`Installing Adoptium release ${release}...`);

  const queryRelease: AdoptiumRelease | null = await fetch(
    `https://api.adoptium.net/v3/assets/release_name/eclipse/${release}?${getQueryParams(
      {
        architecture: getSystemArch(),
        heap_size: "normal",
        image_type: "jre",
        jvm_impl: "hotspot",
        os: getSystemOperatingSystem(),
        project: "jdk",
      },
    )}`,
  )
    .then((res) => res.json())
    .catch(() => null);

  if (!queryRelease || queryRelease.binaries.length === 0) {
    logger.error(`No suitable release found for ${release}.`);
    throw new Error("No suitable release found.");
  }

  logger.info(`Downloading Adoptium release ${release}...`);

  const binary = queryRelease.binaries[0];
  const { name, link, checksum } = binary.package;

  const archiveFile = await openTemporaryFile(name);

  // Download the archive
  const archive = await fetch(link);
  const reader = archive.body?.getReader();

  if (!reader) {
    logger.error("Failed to download the release.");
    throw new Error("Failed to download the release.");
  }

  const calculatedChecksum = await writeStreamToFile(reader, archiveFile);
  logger.debug(`Calculated checksum: ${calculatedChecksum}`);
  await archiveFile.close();

  if (calculatedChecksum !== checksum) {
    logger.error("Checksum verification failed.");
    throw new Error("Checksum verification failed.");
  }

  // Archive is downloaded, extract and find the `bin` path
  logger.info(`Extracting Adoptium release ${release}...`);
  const tempPath = await getTemporaryFolder();
  await extractArchive(archiveFile.path, tempPath);
  logger.info(`Adoptium release ${release} extracted.`);

  const instancePath = await findJreHome(tempPath, release);
  logger.info(`Adoptium release ${release} found JRE home at ${instancePath}.`);

  logger.info(`Installing Adoptium release ${release}...`);
  const id = nanoid();
  const jdkPath = await getJdkFolder();
  const destPath = path.join(jdkPath, id);

  await cp(instancePath, destPath, { recursive: true });
  logger.info(`Adoptium release ${release} installed at ${destPath}.`);

  await writeFile(
    path.join(destPath, "meta.json"),
    JSON.stringify({
      id,
      type: "adoptium",
      release,
      installedAt: new Date().toISOString(),
    }),
  );

  logger.info(
    `Adding Adoptium release ${release} to managed Java instances...`,
  );

  const data = await db
    .insert(javaInstance)
    .values({
      id,
      name: `Adoptium ${release}`,
      path: path.join(
        destPath,
        "bin",
        `java${process.platform === "win32" ? ".exe" : ""}`,
      ),
      version: await getJavaReleaseVersion(release),
      isManaged: true,
      isSystem: false,
    })
    .returning()
    .execute();

  logger.info("Cleaning up temporary files...");

  await deleteTemporaryFolder();

  logger.success(`Adoptium release ${release} installation completed.`);

  revalidatePath("/java");

  return data[0];
};
