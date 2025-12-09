export const getSystemOperatingSystem = () => {
  const platform = process.platform;

  switch (platform) {
    case "win32":
      return "windows";

    case "darwin":
      return "mac";

    case "sunos":
      return "solaris";

    case "aix":
      return "aix";

    default:
      return "linux";
  }
};

export const getSystemArch = () => {
  const arch = process.arch;

  switch (arch) {
    case "x64":
      return "x64";

    case "ia32":
      return "x32";

    case "arm":
      return "arm";

    case "arm64":
      return "aarch64";

    case "ppc64":
      return "ppc64";

    case "s390":
    case "s390x":
      return "s390x";

    case "riscv64":
      return "riscv64";

    default:
      return arch;
  }
};
