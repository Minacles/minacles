"use server";

import { exec } from "node:child_process";

export const $ = async (command: string) => {
  const proc = exec(command);

  return {
    process: proc,
    text: () =>
      new Promise<string>((resolve, reject) => {
        let output = "";

        proc.stdout?.on("data", (data) => {
          output += data;
        });

        proc.stderr?.on("data", (data) => {
          output += data;
        });

        proc.on("close", () => {
          resolve(output);
        });

        proc.on("error", (err) => {
          reject(err);
        });
      }),
  };
};
