#!/usr/bin/env tsx
/**
 * Sync the vendored @cloudflare/forge tarball from a local forge-rs checkout.
 *
 * forge generates cf's commands (its `cli` target). Its npm package ships
 * the native forge binary for every platform, which forge-rs builds and
 * packs with its release scripts:
 *
 *   node releases/npm/scripts/compile.mjs
 *   node releases/npm/scripts/archive.mjs
 *
 * This copies the tarball that `archive.mjs` wrote into vendor/ and points
 * packages/cli at it.
 *
 * Usage:
 *   FORGE_RS_REPO=/path/to/forge-rs pnpm sync:forge
 *
 * Defaults FORGE_RS_REPO to ../forge-rs (a sibling checkout).
 */
import { execFileSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const VENDOR_DIR = join(REPO_ROOT, "vendor");
const CLI_PKG_JSON = join(REPO_ROOT, "packages/cli/package.json");
const FORGE_RS_REPO =
	process.env.FORGE_RS_REPO ?? resolve(REPO_ROOT, "../forge-rs");
const NPM_DIR = join(FORGE_RS_REPO, "releases/npm");

function fatal(msg: string): never {
	console.error(`ERROR: ${msg}`);
	process.exit(1);
}

if (!existsSync(join(NPM_DIR, "package.json"))) {
	fatal(
		`FORGE_RS_REPO doesn't look right (missing releases/npm)\n       FORGE_RS_REPO=${FORGE_RS_REPO}`
	);
}
const { version } = JSON.parse(
	readFileSync(join(NPM_DIR, "package.json"), "utf8")
) as { version: string };
const name = `cloudflare-forge-${version}.tgz`;
const tarball = join(NPM_DIR, "dist", name);
if (!existsSync(tarball)) {
	fatal(
		`${tarball} is missing; run releases/npm/scripts/archive.mjs in forge-rs`
	);
}

for (const old of readdirSync(VENDOR_DIR)) {
	if (old.startsWith("cloudflare-forge-") && old.endsWith(".tgz")) {
		rmSync(join(VENDOR_DIR, old));
	}
}
copyFileSync(tarball, join(VENDOR_DIR, name));
console.log(`Copied ${name} into vendor/`);

const pkg = JSON.parse(readFileSync(CLI_PKG_JSON, "utf8")) as {
	devDependencies: Record<string, string>;
};
pkg.devDependencies["@cloudflare/forge"] = `file:../../vendor/${name}`;
writeFileSync(CLI_PKG_JSON, `${JSON.stringify(pkg, null, "\t")}\n`);

execFileSync("pnpm", ["install"], { cwd: REPO_ROOT, stdio: "inherit" });
