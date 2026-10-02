import { chmodSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

/** Create a Node executable for temporary project fixtures. */
export function nodeScript(body: string): string {
	return `#!/usr/bin/env node\n${body}\n`;
}

/** npm resolves local framework binaries through .cmd shims on Windows. */
export function makeExecutable(
	path: string,
	options: { npmBin?: boolean } = {}
): void {
	const absolutePath = resolve(process.cwd(), path);
	chmodSync(absolutePath, 0o755);
	if (process.platform === "win32" && options.npmBin) {
		writeFileSync(
			`${absolutePath}.cmd`,
			`@echo off\r\n"${process.execPath}" "%~dp0${basename(absolutePath)}" %*\r\n`
		);
	}
}
