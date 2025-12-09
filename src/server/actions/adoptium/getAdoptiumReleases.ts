"use server";

import z from "zod";
import { getQueryParams } from "@/lib/utils";
import { getSystemArch, getSystemOperatingSystem } from "@/server/utils/system";

const schema = z.object({
  releases: z.array(z.string()),
});

export const getAdoptumReleases = async ({ page = 0 }: { page?: number }) => {
  const res = await fetch(
    `https://api.adoptium.net/v3/info/release_names?${getQueryParams({
      architecture: getSystemArch(),
      os: getSystemOperatingSystem(),
      page,
      page_size: 20,
      project: "jdk",
      release_type: "ga",
      semver: false,
      sort_method: "DEFAULT",
      sort_order: "DESC",
      vendor: "eclipse",
    })}`,
  );

  if (!res.ok) {
    return {
      data: [],
      nextPage: undefined,
    };
  }

  const data = schema.parse(await res.json());

  return {
    data: data.releases,
    nextPage: data.releases.length === 20 ? page + 1 : undefined,
  };
};
