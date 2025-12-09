"use server";

import { createHash } from "node:crypto";
import { config } from "@/lib/config";
import { getQueryParams } from "@/lib/utils";
import { getSystemArch, getSystemOperatingSystem } from "@/server/utils/system";
import { writeStreamToFile } from "../system/files";
import { openTemporaryFile } from "../system/temporaryFiles";

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
  // console.log(release);
  // console.log(config("files.directory"));

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
    throw new Error("No suitable release found.");
  }

  const binary = queryRelease.binaries[0];
  const { name, link, checksum } = binary.package;

  const archiveFile = await openTemporaryFile(name);

  const archive = await fetch(link);
  const reader = archive.body?.getReader();

  if (!reader) {
    throw new Error("Failed to download the release.");
  }

  const calculatedChecksum = await writeStreamToFile(reader, archiveFile);
  await archiveFile.close();

  console.log(calculatedChecksum);

  if (calculatedChecksum !== checksum) {
    throw new Error("Checksum verification failed.");
  }

  console.log(binary);
};
