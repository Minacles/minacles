import path from "node:path";
import { getSystemOperatingSystem } from "@/server/utils/system";

export const findJreHome = async (
  archivePath: string,
  release: string,
): Promise<string> => {
  archivePath = path.join(archivePath, `${release}-jre`);

  switch (getSystemOperatingSystem()) {
    case "mac":
      return path.join(archivePath, "Contents", "Home");

    default:
      return archivePath;
  }
};
