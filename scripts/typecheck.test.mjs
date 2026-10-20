import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { getTypechecker } from "./typecheck.mjs";

await test("selects tsrs only where the pinned release provides binaries", () => {
	for (const [platform, arch] of [
		["darwin", "arm64"],
		["linux", "x64"],
		["linux", "arm64"],
	]) {
		assert.equal(getTypechecker(platform, arch), "tsrs");
	}
	for (const [platform, arch] of [
		["win32", "x64"],
		["win32", "arm64"],
		["darwin", "x64"],
		["linux", "arm"],
	]) {
		assert.equal(getTypechecker(platform, arch), "@typescript/native-preview");
	}
});

for (const valid of [true, false]) {
	await test(`checks a project with spaces in its path and ${valid ? "succeeds" : "preserves compiler errors"}`, (context) => {
		const cwd = mkdtempSync(join(tmpdir(), "cf typecheck "));
		context.after(() => rmSync(cwd, { recursive: true, force: true }));
		writeFileSync(
			join(cwd, "project config.json"),
			JSON.stringify({
				compilerOptions: { strict: true, skipLibCheck: true, types: [] },
				files: ["input.ts"],
			})
		);
		writeFileSync(
			join(cwd, "input.ts"),
			valid ? 'const value: string = "hello";' : "const value: string = 123;"
		);
		const result = spawnSync(
			process.execPath,
			[
				fileURLToPath(new URL("./typecheck.mjs", import.meta.url)),
				"--noEmit",
				"--pretty",
				"false",
				"-p",
				"project config.json",
			],
			{ cwd, encoding: "utf8" }
		);
		assert.ifError(result.error);
		assert.equal(result.signal, null);
		assert.equal(result.status, valid ? 0 : 2, result.stdout + result.stderr);
		if (!valid) {
			assert.match(result.stdout + result.stderr, /error TS2322/);
		}
	});
}
