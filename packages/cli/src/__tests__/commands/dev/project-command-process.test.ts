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
const cases = [
	["SIGINT", "graceful"],
	["SIGTERM", "graceful"],
	["SIGHUP", "graceful"],
	["SIGINT", "repeated"],
	["SIGTERM", "repeated"],
	["SIGINT", "parent-exit"],
	["SIGTERM", "parent-exit"],
] as const;

describe.skipIf(process.platform === "win32")(
	"POSIX project command shutdown",
	() => {
		runInTempDir();

		for (const [signal, scenario] of cases) {
			it(`handles ${signal} during ${scenario} shutdown`, async ({
				expect,
			}) => {
				await seed({
					"tool.cjs": `
const fs = require("node:fs");
process.on(${JSON.stringify(signal)}, () => {
  fs.writeFileSync("tool-signaled", "true");
  if (${JSON.stringify(scenario)} === "graceful") process.exit(0);
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
					"parent.mts": `
import { writeFileSync } from "node:fs";
import { runProjectCommand } from ${JSON.stringify(projectSource.href)};
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
							scenario === "graceful"
								? { exitCode: 0, signal }
								: { exitCode: 137, signal: "SIGKILL" }
						);
					}
					for (const name of ["launcher", "tool"]) {
						const pid = Number(readFileSync(`${name}-pid`, "utf8"));
						await vi.waitFor(() =>
							expect(() => process.kill(pid, 0)).toThrow()
						);
					}
				} finally {
					parent.kill("SIGKILL");
					if (existsSync("launcher-pid")) {
						try {
							process.kill(
								-Number(readFileSync("launcher-pid", "utf8")),
								"SIGKILL"
							);
						} catch {
							// Successful shutdown has already removed the command group.
						}
					}
					await completed;
				}
			});
		}
	}
);
