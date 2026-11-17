import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
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

async function canListen(port: number): Promise<boolean> {
	const server = createServer();
	try {
		await new Promise<void>((resolve, reject) => {
			server.once("error", reject);
			server.listen(port, "127.0.0.1", resolve);
		});
		return true;
	} catch (error) {
		if (
			error instanceof Error &&
			"code" in error &&
			error.code === "EADDRINUSE"
		) {
			return false;
		}
		throw error;
	} finally {
		if (server.listening) {
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
	}
}

describe.skipIf(process.platform === "win32")(
	"POSIX project command shutdown",
	() => {
		runInTempDir();

		for (const scenario of ["forced", "graceful", "repeated"] as const) {
			it(`waits for ${scenario} descendant shutdown after the launcher exits`, async ({
				expect,
			}) => {
				await seed({
					"tool.cjs": `
const fs = require("node:fs");
const server = require("node:net").createServer();
process.on("SIGTERM", () => {
  fs.writeFileSync("tool-signaled", "true");
  if (${JSON.stringify(scenario)} === "graceful") {
    const timer = setInterval(() => {
      if (!fs.existsSync("finish-cleanup")) return;
      clearInterval(timer);
      server.close(() => {
        fs.writeFileSync("tool-cleaned", "true");
        process.exit(0);
      });
    }, 20);
  }
});
server.listen(0, "127.0.0.1", () => {
  fs.writeFileSync("tool-port", String(server.address().port));
  fs.writeFileSync("tool-pid", String(process.pid));
});
`,
					"launcher.cjs": `
const fs = require("node:fs");
process.on("SIGTERM", () => process.exit(0));
fs.writeFileSync("launcher-pid", String(process.pid));
require("node:child_process").spawn(process.execPath, ["tool.cjs"], { stdio: "ignore" });
`,
					"parent.mts": `
import { writeFileSync } from "node:fs";
import { runProjectCommand } from ${JSON.stringify(projectSource.href)};
const result = await runProjectCommand("node launcher.cjs", process.cwd(), { output: "silent" });
writeFileSync("result.json", JSON.stringify(result));
process.exit(result.exitCode);
`,
				});
				const parent = spawn(
					process.execPath,
					["--import", loader, "parent.mts"],
					{ cwd: process.cwd(), stdio: "ignore" }
				);
				const completed = new Promise<void>((resolve, reject) => {
					parent.once("error", reject);
					parent.once("close", () => resolve());
				});
				try {
					await vi.waitFor(() => expect(existsSync("tool-pid")).toBe(true), {
						timeout: 10_000,
					});
					const launcherPid = Number(readFileSync("launcher-pid", "utf8"));
					const port = Number(readFileSync("tool-port", "utf8"));
					expect(await canListen(port)).toBe(false);
					expect(parent.kill("SIGTERM")).toBe(true);
					await vi.waitFor(() => {
						expect(existsSync("tool-signaled")).toBe(true);
						expect(() => process.kill(launcherPid, 0)).toThrow();
					});
					expect(parent.exitCode).toBeNull();
					expect(existsSync("result.json")).toBe(false);
					expect(await canListen(port)).toBe(false);
					if (scenario === "graceful") {
						await seed({ "finish-cleanup": "true" });
					} else if (scenario === "repeated") {
						expect(parent.kill("SIGTERM")).toBe(true);
					}
					await vi.waitFor(() => expect(parent.exitCode).toBe(0), {
						timeout: scenario === "forced" ? 7_000 : 2_000,
					});
					await completed;
					expect(JSON.parse(readFileSync("result.json", "utf8"))).toEqual({
						exitCode: 0,
						signal: "SIGTERM",
					});
					expect(existsSync("tool-cleaned")).toBe(scenario === "graceful");
					await vi.waitFor(async () =>
						expect(await canListen(port)).toBe(true)
					);
				} finally {
					parent.kill("SIGKILL");
					if (existsSync("launcher-pid")) {
						try {
							process.kill(
								-Number(readFileSync("launcher-pid", "utf8")),
								"SIGKILL"
							);
						} catch {
							// Successful shutdown has already removed the group.
						}
					}
					await completed;
				}
			});
		}

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
