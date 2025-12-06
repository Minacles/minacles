import { readFile } from "node:fs/promises";
import { get } from "lodash-es";
import { parse } from "smol-toml";
import { z } from "zod";
import { type DotNotation, getObjectSchemaDefaults } from "./utils";

const appConfig = z.object({
  url: z.string().default("http://localhost:3000"),
  secretKey: z.string(),
});

const databaseConfig = z.object({
  file: z
    .string()
    .default("stores.db")
    .transform((val) => `file:${val}`),
});

const configSchema = z.object({
  app: appConfig.default(getObjectSchemaDefaults(appConfig)),
  database: databaseConfig.default(getObjectSchemaDefaults(databaseConfig)),
});

export type Config = z.infer<typeof configSchema>;

// State
let parsedConfig: Partial<Config> = {};

// Methods
export const loadConfig = async () => {
  const text = await readFile(
    process.env.CONFIG_FILE ?? "config.toml",
    "utf-8",
  ).catch(() => null);

  if (!text) return;

  parsedConfig = configSchema.parse(parse(text));
};

export const config = <
  Key extends DotNotation<Config>,
  DefaultValue = undefined,
>(
  key: Key,
  def?: DefaultValue,
) => {
  return get(parsedConfig as Config, key, def);
};
