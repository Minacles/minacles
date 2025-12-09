"use server";

import z from "zod";

const schema = z.object({
  available_lts_releases: z.array(z.number()),
  available_releases: z.array(z.number()),
  most_recent_feature_release: z.number(),
  most_recent_feature_version: z.number(),
  most_recent_lts: z.number(),
  tip_version: z.number(),
});

export const getLtsJavaVersions = async () => {
  const res = await fetch(
    "https://api.adoptium.net/v3/info/available_releases",
  );
  const data = schema.parse(await res.json());

  return data.available_lts_releases;
};
