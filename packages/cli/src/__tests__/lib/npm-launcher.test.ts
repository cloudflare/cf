import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { resolveNpmLauncher } from "../../lib/npm-launcher.js";

function npmInstall(root: string, files: string[] = []): string {
	const bin = join(root, "node_modules", "npm", "bin");
	mkdirSync(bin, { recursive: true });
	for (const name of ["npm", "npx"]) {
		writeFileSync(join(bin, `${name}-cli.js`), "");
	}
	for (const file of files) {
		writeFileSync(join(root, file), "");
	}
	return bin;
}

function fakeExecutable(directory: string, file: string): string {
	mkdirSync(directory, { recursive: true });
	writeFileSync(join(directory, file), "");
	return join(directory, file);
}

// The empty extension lets the real node binary resolve on POSIX test hosts.
function windowsEnv(...path: string[]): NodeJS.ProcessEnv {
	return {
		Path: path.join(delimiter),
		PATHEXT: [".exe", ".cmd", ""].join(delimiter),
	};
}

describe("resolveNpmLauncher", () => {
	it("runs npx through the CLI script with the node.exe beside npx.cmd", () => {
		const root = mkdtempSync(join(tmpdir(), "cf-npm-launcher-"));
		const nodejs = join(root, "nodejs");
		const bin = npmInstall(nodejs, ["npx.cmd", "node.exe"]);
		const otherNode = fakeExecutable(join(root, "other"), "node.exe");

		expect(
			resolveNpmLauncher(
				["npx", "astro", "dev"],
				root,
				windowsEnv(join(root, "empty"), dirname(otherNode), nodejs),
				"win32"
			)
		).toEqual([
			join(nodejs, "node.exe"),
			join(bin, "npx-cli.js"),
			"astro",
			"dev",
		]);
	});

	it("falls back to node from PATH when npm.cmd has no adjacent node.exe", () => {
		const root = mkdtempSync(join(tmpdir(), "cf-npm-launcher-"));
		const prefix = join(root, "prefix");
		const bin = npmInstall(prefix, ["npm.cmd"]);
		const node = fakeExecutable(join(root, "nodejs"), "node.exe");

		expect(
			resolveNpmLauncher(
				["npm", "run", "dev"],
				root,
				windowsEnv(prefix, dirname(node)),
				"win32"
			)
		).toEqual([node, join(bin, "npm-cli.js"), "run", "dev"]);
	});

	it("leaves npm alone when an earlier PATH entry has a native npm.exe shim", () => {
		const root = mkdtempSync(join(tmpdir(), "cf-npm-launcher-"));
		const shim = fakeExecutable(join(root, "shims"), "npm.exe");
		const nodejs = join(root, "nodejs");
		npmInstall(nodejs, ["npm.cmd", "node.exe"]);

		expect(
			resolveNpmLauncher(
				["npm", "run", "dev"],
				root,
				windowsEnv(dirname(shim), nodejs),
				"win32"
			)
		).toEqual(["npm", "run", "dev"]);
	});

	it("prefers an npm upgraded into the global prefix, like npm.cmd", () => {
		const root = mkdtempSync(join(tmpdir(), "cf-npm-launcher-"));
		const nodejs = join(root, "nodejs");
		const prefix = join(root, "prefix");
		const bundledBin = npmInstall(nodejs, ["npm.cmd"]);
		const prefixBin = npmInstall(prefix);
		writeFileSync(
			join(bundledBin, "npm-prefix.js"),
			`console.log(${JSON.stringify(prefix)});`
		);

		expect(
			resolveNpmLauncher(
				["npm.cmd", "run", "build"],
				root,
				windowsEnv(nodejs, dirname(process.execPath)),
				"win32"
			)
		).toEqual([
			process.execPath,
			join(prefixBin, "npm-cli.js"),
			"run",
			"build",
		]);
	});

	it("leaves other commands and other platforms unchanged", () => {
		const root = mkdtempSync(join(tmpdir(), "cf-npm-launcher-"));
		const nodejs = join(root, "nodejs");
		npmInstall(nodejs, ["npx.cmd", "pnpm.cmd", "node.exe"]);

		expect(
			resolveNpmLauncher(["pnpm", "dev"], root, windowsEnv(nodejs), "win32")
		).toEqual(["pnpm", "dev"]);
		expect(
			resolveNpmLauncher(["npx", "astro"], root, windowsEnv(nodejs), "linux")
		).toEqual(["npx", "astro"]);
	});
});
