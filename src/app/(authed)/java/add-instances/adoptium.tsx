"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { getAdoptumReleases } from "@/server/actions/adoptium/getAdoptiumReleases";
import { getLtsJavaVersions } from "@/server/actions/adoptium/getLtsJavaVersions";
import { installAdoptiumRelease } from "@/server/actions/adoptium/installAdoptiumRelease";

export const AddAdoptiumJavaInstance = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  const lts = useQuery({
    queryKey: ["adoptium", "lts"],
    queryFn: () => {
      return getLtsJavaVersions();
    },
  });

  const releases = useInfiniteQuery({
    queryKey: ["adoptium", "releases"],
    queryFn: ({ pageParam }) => {
      return getAdoptumReleases({ page: pageParam });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const ltsReleases = useMemo(() => {
    if (!lts.data || !releases.data) return [];

    const ltsVersions = new Set(lts.data.map((v) => v.toString()));
    const allReleases = releases.data.pages.flatMap((page) => page.data);

    // Group releases by major version
    const releasesByMajor = new Map<string, string[]>();
    allReleases.forEach((release) => {
      const major = release.split("-")[1]?.split(".")[0]; // Extract major from "jdk-X.Y.Z+W"
      if (major) {
        if (!releasesByMajor.has(major)) {
          releasesByMajor.set(major, []);
        }
        releasesByMajor.get(major)?.push(release);
      }
    });

    const result: string[] = [];

    // Add latest patch for each LTS version
    ltsVersions.forEach((ltsVersion) => {
      const releasesForVersion = releasesByMajor.get(ltsVersion);
      if (releasesForVersion && releasesForVersion.length > 0) {
        result.push(releasesForVersion[0]);
      }
    });

    // Add the overall latest version if not already included
    if (
      allReleases.length > 0 &&
      allReleases[0] &&
      !result.includes(allReleases[0])
    ) {
      result.push(allReleases[0]);
    }

    return result;
  }, [lts.data, releases.data]);

  const handleDownload = (release: string) => {
    // closeDialog();
    toast.promise(installAdoptiumRelease(release), {
      loading: (
        <>
          Installing Java <Badge variant="secondary">{release}</Badge>...
        </>
      ),
      success: (
        <>
          Java <Badge variant="secondary">{release}</Badge> installed
          successfully!
        </>
      ),
      error: (
        <>
          Failed to install Java <Badge variant="secondary">{release}</Badge>.
        </>
      ),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {lts.isLoading || releases.isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col max-h-80 overflow-y-auto rounded-lg border">
          {releases.data?.pages.map((page, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: infinite scroll
            <React.Fragment key={i}>
              {page.data.map((release, index) => (
                <button
                  type="button"
                  key={release}
                  className={`p-4 hover:bg-accent transition-colors cursor-pointer border-b last:border-b-0 ${
                    index % 2 === 0 ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handleDownload(release.toString())}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      Java{" "}
                      {release.startsWith("jdk8")
                        ? release.split("-")[0]?.replace("jdk", "")
                        : release.split("-")[1]?.split("+")[0]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Build{" "}
                      {release.includes("+")
                        ? release.split("+")[1]
                        : release.split("-").pop()}
                    </span>
                    {ltsReleases.includes(release) && (
                      <Badge variant="default">LTS</Badge>
                    )}
                  </div>
                </button>
              ))}
            </React.Fragment>
          ))}
          {releases.hasNextPage && (
            <div
              ref={(node) => {
                if (node && !releases.isFetchingNextPage) {
                  const observer = new IntersectionObserver((entries) => {
                    if (entries[0]?.isIntersecting) {
                      releases.fetchNextPage();
                    }
                  });
                  observer.observe(node);
                  return () => observer.disconnect();
                }
              }}
              className="flex justify-center p-4"
            >
              <Spinner />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
