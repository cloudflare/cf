#!/usr/bin/env tsx
/**
 * Sync the vendored @cloudflare/forge tarball from a local forge checkout.
 *
 * Repacks @cloudflare/forge into vendor/ and points packages/cli at it.
 *
 * Usage:
 *   FORGE_REPO=/path/to/forge-checkout pnpm sync:forge
 *
 * Defaults FORGE_REPO to ../forge (a sibling checkout).
 */
import { execFileSync } from "node:child_process";
import {
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
const ROOT_PKG_JSON = join(REPO_ROOT, "package.json");
const CLI_PKG_JSON = join(REPO_ROOT, "packages/cli/package.json");
const FORGE_REPO = process.env.FORGE_REPO ?? resolve(REPO_ROOT, "../forge");

function fatal(msg: string): never {
	console.error(`ERROR: ${msg}`);
	process.exit(1);
}

function run(cmd: string, args: string[], cwd: string): void {
	execFileSync(cmd, args, { cwd, stdio: "inherit" });
}

function pack(pkgDir: string, label: string): void {
	console.log(`Packing ${label}...`);
	run("pnpm", ["pack", "--pack-destination", VENDOR_DIR], pkgDir);
}

function findTarball(prefix: string): string {
	const matches = readdirSync(VENDOR_DIR).filter(
		(name) => name.startsWith(prefix) && name.endsWith(".tgz")
	);
	const [first, ...rest] = matches;
	if (first === undefined) {
		fatal(`expected a tarball starting with '${prefix}' in ${VENDOR_DIR}`);
	}
	if (rest.length > 0) {
		fatal(
			`multiple tarballs matched '${prefix}' in ${VENDOR_DIR}: ${matches.join(", ")}`
		);
	}
	return first;
}

function updateJson(
	path: string,
	mutate: (pkg: Record<string, unknown>) => void
): void {
	const pkg = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
	mutate(pkg);
	writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
}

if (!existsSync(FORGE_REPO)) {
	fatal(
		`FORGE_REPO does not exist: ${FORGE_REPO}\n       Set FORGE_REPO to your local Forge checkout.`
	);
}
const forgePkgDir = join(FORGE_REPO, "packages/forge");
if (!existsSync(forgePkgDir)) {
	fatal(
		`FORGE_REPO doesn't look right (missing packages/forge)\n       FORGE_REPO=${FORGE_REPO}`
	);
}

console.log(`Forge repo: ${FORGE_REPO}`);
console.log(`Vendor dir: ${VENDOR_DIR}`);
console.log();

// --- Clean existing tarballs ---
// Only remove the tarball this script repacks. Other vendored tarballs are
// NOT repacked here and must be preserved — wiping them breaks
// `pnpm install` (their file: specifiers point at filenames that would no
// longer exist).
for (const name of readdirSync(VENDOR_DIR)) {
	if (name.endsWith(".tgz") && name.startsWith("cloudflare-forge-")) {
		rmSync(join(VENDOR_DIR, name));
	}
}

pack(forgePkgDir, "@cloudflare/forge");

// --- Discover the resulting filename (the version may have changed) ---
const forgeTgz = findTarball("cloudflare-forge-");

console.log();
console.log(`Vendored: ${forgeTgz}`);
console.log();

// --- Update the file: specifier ---
updateJson(CLI_PKG_JSON, (pkg) => {
	const devDeps = pkg.devDependencies as Record<string, string>;
	devDeps["@cloudflare/forge"] = `file:../../vendor/${forgeTgz}`;
	delete devDeps["@cloudflare/forge-transformer-sdk-ts"];
});

// --- Install + reformat ---
// The vendored tarball keeps its package version and filename, so pnpm's
// existing lockfile entry still contains the previous tarball integrity.
// Repair those entries before reinstalling the newly packed contents.
console.log("Reinstalling and refreshing vendored tarball integrities...");
run("pnpm", ["install", "--force", "--fix-lockfile"], REPO_ROOT);
console.log("Reformatting updated package.json files...");
run("pnpm", ["exec", "vp", "fmt", ROOT_PKG_JSON, CLI_PKG_JSON], REPO_ROOT);

console.log();
console.log("Done. Review with: git diff");
