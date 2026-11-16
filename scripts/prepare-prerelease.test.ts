import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const prepareScript = fileURLToPath(
	new URL("./prepare-prerelease.mjs", import.meta.url)
);
const changesetCli = fileURLToPath(
	new URL("../bin.js", import.meta.resolve("@changesets/cli"))
);

for (const { version, tag, expected } of [
	{ version: "1.0.0-beta.32", tag: "rc", expected: "1.0.0-rc.0" },
	{ version: "1.0.0-rc.0", tag: "rc", expected: "1.0.0-rc.1" },
	{ version: "1.0.0-rc.33", tag: "rc", expected: "1.0.0-rc.34" },
	{ version: "1.0.0-beta.32", tag: "beta", expected: "1.0.0-beta.33" },
	{ version: "0.14.0", tag: "rc", expected: "0.15.0-rc.0" },
]) {
	await test(`versions ${version} on ${tag} as ${expected}`, (context) => {
		const cwd = mkdtempSync(join(tmpdir(), "cf-prerelease-"));
		context.after(() => rmSync(cwd, { recursive: true, force: true }));
		mkdirSync(join(cwd, ".changeset"));
		mkdirSync(join(cwd, "packages/cli"), { recursive: true });
		const writeJson = (path: string, value: unknown) =>
			writeFileSync(join(cwd, path), `${JSON.stringify(value)}\n`);
		writeJson("package.json", {
			name: "cf-release-test",
			private: true,
			workspaces: ["packages/*"],
		});
		writeJson("packages/cli/package.json", { name: "cf", version });
		writeJson(".changeset/config.json", { changelog: false });
		writeJson(".changeset/pre.json", {
			mode: "pre",
			tag,
			initialVersions: { cf: "0.14.0" },
			changesets: [],
		});
		writeFileSync(
			join(cwd, ".changeset/release.md"),
			'---\n"cf": minor\n---\n\nPrepare the release\n'
		);

		execFileSync(process.execPath, [prepareScript], { cwd });
		execFileSync(process.execPath, [changesetCli, "version"], {
			cwd,
			stdio: "pipe",
		});

		const updated = JSON.parse(
			readFileSync(join(cwd, "packages/cli/package.json"), "utf8")
		);
		assert.equal(updated.version, expected);
	});
}

for (const preState of [undefined, { mode: "exit", tag: "rc" }]) {
	await test(`leaves versions alone with prerelease state ${JSON.stringify(preState)}`, (context) => {
		const cwd = mkdtempSync(join(tmpdir(), "cf-prerelease-"));
		context.after(() => rmSync(cwd, { recursive: true, force: true }));
		mkdirSync(join(cwd, "packages/cli"), { recursive: true });
		const manifest = '{"name":"cf","version":"1.0.0-beta.32"}\n';
		writeFileSync(join(cwd, "packages/cli/package.json"), manifest);
		if (preState) {
			mkdirSync(join(cwd, ".changeset"));
			writeFileSync(join(cwd, ".changeset/pre.json"), JSON.stringify(preState));
		}

		execFileSync(process.execPath, [prepareScript], { cwd });

		assert.equal(
			readFileSync(join(cwd, "packages/cli/package.json"), "utf8"),
			manifest
		);
	});
}
