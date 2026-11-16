import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, it, vi } from "vite-plus/test";

const loader = pathToFileURL(
	createRequire(import.meta.url).resolve("tsx")
).href;
const projectSource = new URL("../../../lib/autoconfig.ts", import.meta.url);
const delegateSource = new URL("../../../lib/delegate.ts", import.meta.url);
const cases = [
	["SIGINT", "graceful"],
	["SIGTERM", "graceful"],
	["SIGHUP", "graceful"],
	["SIGINT", "repeated"],
	["SIGTERM", "repeated"],
	["SIGINT", "parent-exit"],
	["SIGTERM", "parent-exit"],
	["SIGINT", "delegated"],
	["SIGTERM", "delegated"],
	["SIGINT", "delegated-programmatic"],
] as const;

describe.skipIf(process.platform === "win32")(
	"POSIX project command shutdown",
	() => {
		runInTempDir();

		for (const [signal, scenario] of cases) {
			const isDelegated = scenario.startsWith("delegated");
			it(`handles ${signal} during ${scenario} shutdown`, async ({
				expect,
			}) => {
				await seed({
					"tool.cjs": `
const fs = require("node:fs");
process.on(${JSON.stringify(signal)}, () => {
  fs.writeFileSync("tool-signaled", "true");
  if (${JSON.stringify(scenario)} === "graceful") process.exit(0);
  if (${isDelegated}) {
    setTimeout(() => {
      fs.writeFileSync("tool-cleaned", "true");
      process.exit(0);
    }, 250);
  }
});
setInterval(() => {}, 1000);
fs.writeFileSync("tool-pid", String(process.pid));
`,
					"launcher.cjs": `
const fs = require("node:fs");
const { spawn } = require("node:child_process");
process.on(${JSON.stringify(signal)}, () => {});
spawn(process.execPath, ["tool.cjs"], { stdio: "inherit" })
  .on("exit", () => process.exit(0));
fs.writeFileSync("launcher-pid", String(process.pid));
`,
					"node_modules/cf/package.json": JSON.stringify({
						name: "cf",
						version: "9.9.9",
						type: "module",
						bin: { cf: "./local.mjs" },
						exports: { "./package.json": "./package.json" },
					}),
					"node_modules/cf/local.mjs": `
import { writeFileSync } from "node:fs";
import { runProjectCommand } from ${JSON.stringify(projectSource.href)};
writeFileSync("local-cf-pid", String(process.pid));
const result = await runProjectCommand("node launcher.cjs", process.cwd(), { output: "silent" });
writeFileSync("result.json", JSON.stringify(result));
process.exit(result.exitCode);
`,
					"parent.mts": `
import { writeFileSync } from "node:fs";
import { runProjectCommand } from ${JSON.stringify(projectSource.href)};
if (${isDelegated}) {
  Object.defineProperty(process.stdin, "isTTY", { value: ${scenario === "delegated"} });
  const { maybeDelegateToLocalInstall } = await import(${JSON.stringify(delegateSource.href)});
  const result = await maybeDelegateToLocalInstall({ ownPackageJsonPath: null });
  process.exit(result.exitCode ?? 1);
}
const execution = runProjectCommand("node launcher.cjs", process.cwd(), { output: "silent" });
if (${JSON.stringify(scenario)} === "parent-exit") {
  process.on(${JSON.stringify(signal)}, () => process.exit(42));
}
const result = await execution;
writeFileSync("result.json", JSON.stringify(result));
process.exit(result.exitCode);
`,
				});
				const parent = spawn(
					process.execPath,
					["--import", loader, "parent.mts"],
					{
						cwd: process.cwd(),
						stdio: "ignore",
						env: {
							...process.env,
							NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --import ${loader}`,
						},
					}
				);
				const completed = new Promise<void>((resolve, reject) => {
					parent.once("error", reject);
					parent.once("close", () => resolve());
				});
				try {
					await vi.waitFor(() => expect(existsSync("tool-pid")).toBe(true), {
						timeout: 10_000,
					});
					if (scenario === "delegated" && signal === "SIGINT") {
						// A terminal sends one interrupt to both CLIs. Let the local
						// CLI begin cleanup before the global CLI handles its copy.
						process.kill(Number(readFileSync("local-cf-pid", "utf8")), signal);
						await vi.waitFor(() =>
							expect(existsSync("tool-signaled")).toBe(true)
						);
					}
					expect(parent.kill(signal)).toBe(true);
					if (scenario === "repeated") {
						await vi.waitFor(() =>
							expect(existsSync("tool-signaled")).toBe(true)
						);
						expect(parent.kill(signal)).toBe(true);
					}
					await vi.waitFor(() => expect(parent.exitCode).not.toBeNull(), {
						timeout: 2_000,
					});
					await completed;
					if (scenario === "parent-exit") {
						expect(parent.exitCode).toBe(42);
						expect(existsSync("result.json")).toBe(false);
					} else {
						expect(JSON.parse(readFileSync("result.json", "utf8"))).toEqual(
							scenario === "repeated"
								? { exitCode: 137, signal: "SIGKILL" }
								: { exitCode: 0, signal }
						);
					}
					if (isDelegated) {
						expect(readFileSync("tool-cleaned", "utf8")).toBe("true");
					}
					for (const name of [
						"launcher",
						"tool",
						...(isDelegated ? ["local-cf"] : []),
					]) {
						const pid = Number(readFileSync(`${name}-pid`, "utf8"));
						await vi.waitFor(() =>
							expect(() => process.kill(pid, 0)).toThrow()
						);
					}
				} finally {
					parent.kill("SIGKILL");
					for (const [name, processGroup] of [
						["launcher", true],
						["local-cf", false],
					] as const) {
						if (existsSync(`${name}-pid`)) {
							try {
								const pid = Number(readFileSync(`${name}-pid`, "utf8"));
								process.kill(processGroup ? -pid : pid, "SIGKILL");
							} catch {
								// Successful shutdown has already removed the process.
							}
						}
					}
					await completed;
				}
			});
		}
	}
);
