import type { z } from "zod";

export const getObjectSchemaDefaults = <Schema extends z.ZodObject>(
  schema: Schema,
) => {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      return [key, (value as z.ZodDefault).def?.defaultValue];
    }),
  ) as z.infer<Schema>;
};

// Utility types for dot notation
export type DotNotation<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? DotNotation<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type ResolveDotNotation<
  T,
  Path extends string,
> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? ResolveDotNotation<T[Key], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

export type Coalesce<T, Fallback> = T extends null | undefined | unknown
  ? Fallback
  : T;
