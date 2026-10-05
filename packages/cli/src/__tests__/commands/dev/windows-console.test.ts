import { execFile } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vite-plus/test";
import { nodeScript } from "../../helpers/executable.js";

const execute = promisify(execFile);
const loader = pathToFileURL(
	createRequire(import.meta.url).resolve("tsx")
).href;
const harness = fileURLToPath(
	new URL("../../helpers/windows-console.ps1", import.meta.url)
);
const spawnSource = new URL("../../../commands/dev/spawn.ts", import.meta.url);
const projectSource = new URL("../../../lib/autoconfig.ts", import.meta.url);

describe.skipIf(process.platform !== "win32")("Windows console Ctrl+C", () => {
	it.each([
		["implementation", "stdout"],
		["implementation", "stderr"],
		["implementation", "silent"],
		["framework", "stdout"],
		["framework", "stderr"],
		["framework", "silent"],
	] as const)(
		"lets the %s delegate finish cleanup with %s output",
		async (launcher, output) => {
			const directory = mkdtempSync(join(tmpdir(), "cf console "));
			const driver = join(directory, "parent.mts");
			const delegate = join(directory, "delegate");
			const framework = join(directory, "framework.cmd");
			writeFileSync(
				delegate,
				nodeScript(`
const { writeFileSync } = require("node:fs");
let signals = 0;
process.on("SIGINT", () => {
  signals++;
  setTimeout(() => {
    writeFileSync("cleanup.json", JSON.stringify({ signals }));
    process.exit(0);
  }, 250);
});
setInterval(() => {}, 1000);
writeFileSync("delegate-ready.json", JSON.stringify({ pid: process.pid }));
`)
			);
			// Cover the extensionless shebang and npm's Windows .cmd launch paths.
			writeFileSync(
				framework,
				`@echo off\r\n"${process.execPath}" "%~dp0delegate" %*\r\n`
			);
			writeFileSync(
				driver,
				`
import { existsSync, writeFileSync } from "node:fs";
import { spawnImpl } from ${JSON.stringify(spawnSource.href)};
import { runProjectCommand } from ${JSON.stringify(projectSource.href)};
const sigintListeners = process.listenerCount("SIGINT");
const sigtermListeners = process.listenerCount("SIGTERM");
const execution = ${
					launcher === "implementation"
						? `spawnImpl({
  impl: { ecosystem: "npm", pkg: "test", installHint: "test" },
  binary: ${JSON.stringify(delegate)},
  manifestPath: "test"
}, "dev", [], { output: ${JSON.stringify(output)} })`
						: `runProjectCommand(${JSON.stringify(directory)}, ${JSON.stringify(`"${framework}"`)}, { output: ${JSON.stringify(output)} })`
				};
writeFileSync("parent-ready.json", JSON.stringify({ pid: process.pid }));
const result = await execution;
writeFileSync("parent-result.json", JSON.stringify({
  ...result,
  cleanupCompleted: existsSync("cleanup.json"),
  sigintListenersRestored: process.listenerCount("SIGINT") === sigintListeners,
  sigtermListenersRestored: process.listenerCount("SIGTERM") === sigtermListeners
}));
process.exit(result.exitCode);
`
			);
			try {
				try {
					await execute(
						"powershell.exe",
						[
							"-NoProfile",
							"-NonInteractive",
							"-ExecutionPolicy",
							"Bypass",
							"-File",
							harness,
							"-NodePath",
							process.execPath,
							"-Loader",
							loader,
							"-Driver",
							driver,
							"-Directory",
							directory,
						],
						{ timeout: 25_000, windowsHide: true }
					);
				} catch (error) {
					const diagnostics = join(directory, "harness-error.txt");
					throw new Error(
						existsSync(diagnostics)
							? readFileSync(diagnostics, "utf8")
							: "Windows console harness failed",
						{ cause: error }
					);
				}
				expect(
					JSON.parse(readFileSync(join(directory, "cleanup.json"), "utf8"))
				).toEqual({ signals: 1 });
				expect(
					JSON.parse(
						readFileSync(join(directory, "parent-result.json"), "utf8")
					)
				).toEqual({
					exitCode: 0,
					signal: "SIGINT",
					cleanupCompleted: true,
					sigintListenersRestored: true,
					sigtermListenersRestored: true,
				});
				for (const name of ["parent", "delegate"]) {
					const { pid } = JSON.parse(
						readFileSync(join(directory, `${name}-ready.json`), "utf8")
					) as { pid: number };
					expect(() => process.kill(pid, 0)).toThrow();
				}
			} finally {
				for (const name of ["parent", "delegate"]) {
					const ready = join(directory, `${name}-ready.json`);
					if (existsSync(ready)) {
						const { pid } = JSON.parse(readFileSync(ready, "utf8")) as {
							pid: number;
						};
						try {
							process.kill(pid, 0);
							await execute("taskkill.exe", ["/PID", String(pid), "/T", "/F"]);
						} catch {
							// The process normally exits before the harness returns.
						}
					}
				}
				rmSync(directory, { recursive: true, force: true });
			}
		}
	);
});
