import { execFile } from "node:child_process";
import {
	existsSync,
	mkdirSync,
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
import type { CommandOutput } from "../../../lib/autoconfig.js";

const execute = promisify(execFile);
const loader = pathToFileURL(
	createRequire(import.meta.url).resolve("tsx")
).href;
const harness = fileURLToPath(
	new URL("../../helpers/windows-console.ps1", import.meta.url)
);
const spawnSource = new URL("../../../commands/dev/spawn.ts", import.meta.url);
const projectSource = new URL("../../../lib/autoconfig.ts", import.meta.url);
// npm's bin/npx.cmd as shipped with Node.js.
const NPX_CMD = [
	":: Created by npm, please don't edit manually.",
	"@ECHO OFF",
	"",
	"SETLOCAL",
	"",
	'SET "NODE_EXE=%~dp0\\node.exe"',
	'IF NOT EXIST "%NODE_EXE%" (',
	'  SET "NODE_EXE=node"',
	")",
	"",
	'SET "NPM_PREFIX_JS=%~dp0\\node_modules\\npm\\bin\\npm-prefix.js"',
	'SET "NPX_CLI_JS=%~dp0\\node_modules\\npm\\bin\\npx-cli.js"',
	'FOR /F "delims=" %%F IN (\'CALL "%NODE_EXE%" "%NPM_PREFIX_JS%"\') DO (',
	'  SET "NPM_PREFIX_NPX_CLI_JS=%%F\\node_modules\\npm\\bin\\npx-cli.js"',
	")",
	'IF EXIST "%NPM_PREFIX_NPX_CLI_JS%" (',
	'  SET "NPX_CLI_JS=%NPM_PREFIX_NPX_CLI_JS%"',
	")",
	"",
	'"%NODE_EXE%" "%NPX_CLI_JS%" %*',
	"",
].join("\r\n");

describe.skipIf(process.platform !== "win32")("Windows console Ctrl+C", () => {
	it.each<["implementation" | "framework" | "npx", CommandOutput]>([
		["implementation", "inherit"],
		["implementation", "stderr"],
		["implementation", "silent"],
		["framework", "inherit"],
		["framework", "stderr"],
		["framework", "silent"],
		["npx", "inherit"],
		["npx", "stderr"],
		["npx", "silent"],
	])(
		"lets the %s delegate finish cleanup with %s output",
		async (launcher, output) => {
			const directory = mkdtempSync(join(tmpdir(), "cf console "));
			const driver = join(directory, "parent.mts");
			const delegate = join(directory, "delegate");
			const framework = join(directory, "framework.cmd");
			const npmDirectory = join(directory, "nodejs");
			const npmBin = join(npmDirectory, "node_modules", "npm", "bin");
			const delegateSource = nodeScript(`
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
`);
			writeFileSync(delegate, delegateSource);
			// Cover the extensionless shebang and npm's Windows .cmd launch paths.
			// npm ends the batch context before running Node to avoid its Ctrl+C
			// confirmation prompt: npm/cmd-shim's lib/index.js uses this tail.
			writeFileSync(
				framework,
				`@echo off\r\nsetlocal\r\nendlocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "${process.execPath}" "%~dp0delegate" %*\r\n`
			);
			// The npx.cmd bundled with Node has no such tail, so mirror it verbatim.
			mkdirSync(npmBin, { recursive: true });
			writeFileSync(join(npmDirectory, "npx.cmd"), NPX_CMD);
			writeFileSync(join(npmBin, "npx-cli.js"), delegateSource);
			writeFileSync(
				join(npmBin, "npm-prefix.js"),
				`console.log(${JSON.stringify(directory)});\n`
			);
			const executions = {
				implementation: `spawnImpl({
  impl: { ecosystem: "npm", pkg: "test", installCommands: ["test"] },
  binary: ${JSON.stringify(delegate)},
  manifestPath: "test"
}, "dev", [], { output: ${JSON.stringify(output)} })`,
				framework: `runProjectCommand(${JSON.stringify(`"${framework}"`)}, ${JSON.stringify(directory)}, { output: ${JSON.stringify(output)} })`,
				npx: `runProjectCommand("npx astro dev", ${JSON.stringify(directory)}, { output: ${JSON.stringify(output)} })`,
			};
			writeFileSync(
				driver,
				`
import { existsSync, writeFileSync } from "node:fs";
import { delimiter } from "node:path";
import { spawnImpl } from ${JSON.stringify(spawnSource.href)};
import { runProjectCommand } from ${JSON.stringify(projectSource.href)};
process.env.PATH = ${JSON.stringify(npmDirectory)} + delimiter + process.env.PATH;
const sigintListeners = process.listenerCount("SIGINT");
const sigtermListeners = process.listenerCount("SIGTERM");
const execution = ${executions[launcher]};
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
