"use server";

export const getJavaReleaseVersion = async (release: string) => {
  return release.startsWith("jdk8")
    ? release.split("-")[0]?.split("u")[0]?.replace("jdk", "")
    : release.split("-")[1]?.split("+")[0];
};
