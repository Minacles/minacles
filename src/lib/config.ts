import "server-only";
import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { get } from "lodash-es";
import { parse } from "smol-toml";
import { z } from "zod";
import { type DotNotation, getObjectSchemaDefaults } from "./utils";

const appConfig = z.object({
  name: z.string().default("Minacles"),
  url: z.string().default("http://localhost:3000"),
  secretKey: z.string(),
});

const databaseConfig = z.object({
  file: z
    .string()
    .transform((val) => `file:${val}`)
    .default("file:stores.db"),
});

const filesSchema = z.object({
  directory: z
    .string()
    .transform((v) => resolvePath(v))
    .default(process.cwd()),
});

const configSchema = z.object({
  app: appConfig.default(getObjectSchemaDefaults(appConfig)),
  database: databaseConfig.default(getObjectSchemaDefaults(databaseConfig)),
  files: filesSchema.default(getObjectSchemaDefaults(filesSchema)),
});

export type Config = z.infer<typeof configSchema>;

// State
const parsedConfig = configSchema.parse(
  parse(
    (() => {
      try {
        return readFileSync(process.env.CONFIG_FILE ?? "config.toml", "utf-8");
      } catch {
        return "";
      }
    })(),
  ),
);

export const config = <
  Key extends DotNotation<Config>,
  DefaultValue = undefined,
>(
  key: Key,
  def?: DefaultValue,
) => {
  return get(parsedConfig as Config, key, def);
};
