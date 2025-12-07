import { type SpawnOptions, spawn } from "node:child_process";
import { platform } from "node:os";

/**
 * Error thrown when a shell command fails
 */
export class ShellError extends Error {
  constructor(
    message: string,
    public exitCode: number,
    public stdout: Buffer,
    public stderr: Buffer,
    public command: string,
  ) {
    super(message);
    this.name = "ShellError";
  }
}

interface ShellPromise extends Promise<ShellResult> {
  /**
   * Suppress output to stdout/stderr
   */
  quiet(): ShellPromise;

  /**
   * Get output as text (automatically calls .quiet())
   */
  text(): Promise<string>;

  /**
   * Get combined stdout and stderr as text
   */
  combined(): Promise<string>;

  /**
   * Get output as JSON
   */
  json<T = unknown>(): Promise<T>;

  /**
   * Get output as a Blob
   */
  blob(): Promise<Blob>;

  /**
   * Get output line by line
   */
  lines(): AsyncIterableIterator<string>;

  /**
   * Don't throw on non-zero exit codes
   */
  nothrow(): ShellPromise;

  /**
   * Set whether to throw on non-zero exit codes
   */
  throws(shouldThrow: boolean): ShellPromise;

  /**
   * Set environment variables for this command
   */
  env(vars: Record<string, string> | undefined): ShellPromise;

  /**
   * Set working directory for this command
   */
  cwd(dir: string): ShellPromise;
}

interface ShellResult {
  stdout: Buffer;
  stderr: Buffer;
  exitCode: number;
}

interface ShellConfig {
  env?: Record<string, string>;
  cwd?: string;
  throwOnError?: boolean;
}

class ShellCommand {
  private config: ShellConfig = {
    env: process.env as Record<string, string>,
    cwd: process.cwd(),
    throwOnError: true,
  };
  private quietMode = false;
  private executionPromise: Promise<ShellResult> | null = null;

  constructor(
    private command: string,
    globalConfig: ShellConfig,
  ) {
    this.config = { ...globalConfig };
  }

  quiet(): this {
    this.quietMode = true;
    return this;
  }

  async text(): Promise<string> {
    this.quietMode = true;
    const result = await this.execute();
    // If stdout is empty but stderr has content, return stderr
    // This is common for tools like Java that output to stderr
    if (result.stdout.length === 0 && result.stderr.length > 0) {
      return result.stderr.toString("utf-8");
    }
    return result.stdout.toString("utf-8");
  }

  async combined(): Promise<string> {
    this.quietMode = true;
    const result = await this.execute();
    const stdout = result.stdout.toString("utf-8");
    const stderr = result.stderr.toString("utf-8");
    return stdout + stderr;
  }

  async json<T = unknown>(): Promise<T> {
    const text = await this.text();
    return JSON.parse(text) as T;
  }

  async blob(): Promise<Blob> {
    this.quietMode = true;
    const result = await this.execute();
    return new Blob([new Uint8Array(result.stdout)], { type: "text/plain" });
  }

  async *lines(): AsyncIterableIterator<string> {
    const text = await this.text();
    const lines = text.split("\n");
    for (const line of lines) {
      if (line) yield line;
    }
  }

  nothrow(): this {
    this.config.throwOnError = false;
    return this;
  }

  throws(shouldThrow: boolean): this {
    this.config.throwOnError = shouldThrow;
    return this;
  }

  env(vars: Record<string, string> | undefined): this {
    if (vars === undefined) {
      this.config.env = process.env as Record<string, string>;
    } else {
      this.config.env = vars;
    }
    return this;
  }

  cwd(dir: string): this {
    this.config.cwd = dir;
    return this;
  }

  private async execute(): Promise<ShellResult> {
    // Cache the execution so it only runs once
    if (this.executionPromise) {
      return this.executionPromise;
    }

    this.executionPromise = new Promise((resolve, reject) => {
      const isWindows = platform() === "win32";
      const shell = isWindows ? "powershell.exe" : "/bin/sh";
      const shellArgs = isWindows
        ? ["-Command", this.command]
        : ["-c", this.command];

      const options: SpawnOptions = {
        cwd: this.config.cwd,
        env: this.config.env as NodeJS.ProcessEnv,
        stdio: ["ignore", "pipe", "pipe"],
      };

      const child = spawn(shell, shellArgs, options);

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      child.stdout?.on("data", (chunk: Buffer) => {
        stdoutChunks.push(chunk);
        if (!this.quietMode) {
          process.stdout.write(chunk);
        }
      });

      child.stderr?.on("data", (chunk: Buffer) => {
        stderrChunks.push(chunk);
        if (!this.quietMode) {
          process.stderr.write(chunk);
        }
      });

      child.on("error", (error) => {
        reject(error);
      });

      child.on("close", (code) => {
        const exitCode = code ?? 0;
        const stdout = Buffer.concat(stdoutChunks);
        const stderr = Buffer.concat(stderrChunks);

        if (exitCode !== 0 && this.config.throwOnError) {
          reject(
            new ShellError(
              `Command failed with exit code ${exitCode}: ${this.command}`,
              exitCode,
              stdout,
              stderr,
              this.command,
            ),
          );
        } else {
          resolve({ stdout, stderr, exitCode });
        }
      });
    });

    return this.executionPromise;
  }

  toPromise(): Promise<ShellResult> {
    return this.execute();
  }

  // biome-ignore lint/suspicious/noThenProperty: Required for Promise-like behavior
  then<TResult1 = ShellResult, TResult2 = never>(
    onfulfilled?:
      | ((value: ShellResult) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
  ): Promise<ShellResult | TResult> {
    return this.execute().catch(onrejected);
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<ShellResult> {
    return this.execute().finally(onfinally);
  }
}

/**
 * Shell command builder
 */
class Shell {
  private config: ShellConfig = {
    env: process.env as Record<string, string>,
    cwd: process.cwd(),
    throwOnError: true,
  };

  /**
   * Set global environment variables for all commands
   */
  env(vars: Record<string, string> | undefined): void {
    if (vars === undefined) {
      this.config.env = process.env as Record<string, string>;
    } else {
      this.config.env = vars;
    }
  }

  /**
   * Set global working directory for all commands
   */
  cwd(dir: string): void {
    this.config.cwd = dir;
  }

  /**
   * Set global throw behavior for all commands
   */
  nothrow(): void {
    this.config.throwOnError = false;
  }

  /**
   * Set global throw behavior for all commands
   */
  throws(shouldThrow: boolean): void {
    this.config.throwOnError = shouldThrow;
  }

  /**
   * Execute a shell command using template literals
   */
  exec(strings: TemplateStringsArray, ...values: unknown[]): ShellPromise {
    const command = this.buildCommand(strings, values);
    const shellCommand = new ShellCommand(command, this.config);
    return shellCommand as unknown as ShellPromise;
  }

  /**
   * Escape a string for safe use in shell commands
   */
  escape(str: string): string {
    // Escape special shell characters
    return str.replace(/(["`$\\])/g, "\\$1");
  }

  /**
   * Perform brace expansion on a command string
   */
  braces(command: string): string[] {
    const braceRegex = /\{([^}]+)\}/;
    const match = command.match(braceRegex);

    if (!match) {
      return [command];
    }

    const [fullMatch, content] = match;
    const options = content.split(",");
    const results: string[] = [];

    for (const option of options) {
      const expanded = command.replace(fullMatch, option.trim());
      results.push(...this.braces(expanded));
    }

    return results;
  }

  private buildCommand(
    strings: TemplateStringsArray,
    values: unknown[],
  ): string {
    let command = "";

    for (let i = 0; i < strings.length; i++) {
      command += strings[i];

      if (i < values.length) {
        const value = values[i];

        // Handle raw strings (unescaped)
        if (
          value &&
          typeof value === "object" &&
          "raw" in value &&
          typeof value.raw === "string"
        ) {
          command += value.raw;
        } else {
          // Escape by default to prevent injection
          command += this.escape(String(value));
        }
      }
    }

    return command;
  }
}

const shellInstance = new Shell();

/**
 * Execute shell commands using template literals
 *
 * @example
 * ```ts
 * import { $ } from "./shell";
 *
 * // Basic usage
 * await $`echo "Hello World!"`;
 *
 * // Get output as text
 * const output = await $`pwd`.text();
 *
 * // Don't throw on errors
 * const result = await $`some-command`.nothrow();
 *
 * // Set environment variables
 * await $`echo $FOO`.env({ FOO: "bar" });
 *
 * // Change working directory
 * await $`pwd`.cwd("/tmp");
 * ```
 */
export const $ = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): ShellPromise => {
  return shellInstance.exec(strings, ...values);
};

// Expose utility functions on the $ object
Object.assign($, {
  escape: shellInstance.escape.bind(shellInstance),
  braces: shellInstance.braces.bind(shellInstance),
  env: shellInstance.env.bind(shellInstance),
  cwd: shellInstance.cwd.bind(shellInstance),
  nothrow: shellInstance.nothrow.bind(shellInstance),
  throws: shellInstance.throws.bind(shellInstance),
});

// Type augmentation for the $ function
export interface $ {
  (strings: TemplateStringsArray, ...values: unknown[]): ShellPromise;
  escape(str: string): string;
  braces(command: string): string[];
  env(vars: Record<string, string> | undefined): void;
  cwd(dir: string): void;
  nothrow(): void;
  throws(shouldThrow: boolean): void;
}
