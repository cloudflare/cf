#!/usr/bin/env tsx
/**
 * Sync vendored @cloudflare/forge tarballs from a local forge checkout.
 *
 * Pre-packs forge by running its SDK generate + transformer build pipeline so
 * the tarballs always reflect the current state of the working tree
 * (skip with FORGE_SKIP_PREBUILD=1).
 *
 * Repacks two tarballs into vendor/:
 *   - @cloudflare/forge
 *   - @cloudflare/forge-transformer-sdk-ts
 *
 * Usage:
 *   FORGE_REPO=/path/to/forge-checkout pnpm sync:forge
 *   FORGE_SKIP_PREBUILD=1 pnpm sync:forge   # skip generate + build steps
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
const SKIP_PREBUILD = process.env.FORGE_SKIP_PREBUILD === "1";

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

function findTarball(prefix: string, exclude?: string): string {
	const matches = readdirSync(VENDOR_DIR).filter(
		(name) =>
			name.startsWith(prefix) &&
			name.endsWith(".tgz") &&
			(exclude === undefined || !name.startsWith(exclude))
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
const forgeTransformerSdkPkgDir = join(
	FORGE_REPO,
	"packages/cloudflare-forge-transformer-sdk-ts"
);
if (!existsSync(forgePkgDir) || !existsSync(forgeTransformerSdkPkgDir)) {
	fatal(
		`FORGE_REPO doesn't look right (missing packages/forge or packages/cloudflare-forge-transformer-sdk-ts)\n       FORGE_REPO=${FORGE_REPO}`
	);
}

console.log(`Forge repo: ${FORGE_REPO}`);
console.log(`Vendor dir: ${VENDOR_DIR}`);
console.log();

// --- Pre-build forge: build the transformer ---
// Without this step the tarballs reflect whatever was last manually built
// in the forge checkout.
// Set FORGE_SKIP_PREBUILD=1 if you've already built and just want to repack.
if (SKIP_PREBUILD) {
	console.log("Skipping forge prebuild (FORGE_SKIP_PREBUILD=1).");
} else {
	console.log("Building forge-transformer-sdk-ts...");
	run(
		"pnpm",
		["--filter", "@cloudflare/forge-transformer-sdk-ts", "run", "build"],
		FORGE_REPO
	);
}
console.log();

// --- Clean existing tarballs ---
// Only remove the tarballs this script repacks. Other vendored tarballs
// (e.g. workers-auth) are NOT repacked here and must be preserved —
// wiping them breaks `pnpm install` (their file: specifiers point at
// filenames that would no longer exist).
const MANAGED_TARBALL_PREFIXES = [
	"cloudflare-forge-",
	"cloudflare-forge-transformer-sdk-ts-",
];
for (const name of readdirSync(VENDOR_DIR)) {
	if (
		name.endsWith(".tgz") &&
		MANAGED_TARBALL_PREFIXES.some((prefix) => name.startsWith(prefix))
	) {
		rmSync(join(VENDOR_DIR, name));
	}
}

// --- Pack both public packages ---
pack(forgePkgDir, "@cloudflare/forge");
pack(forgeTransformerSdkPkgDir, "@cloudflare/forge-transformer-sdk-ts");

// --- Discover resulting filenames (versions may have changed) ---
// "cloudflare-forge-" also matches the transformer package.
const forgeTgz = findTarball(
	"cloudflare-forge-",
	"cloudflare-forge-transformer-sdk-ts-"
);
const forgeTransformerSdkTgz = findTarball(
	"cloudflare-forge-transformer-sdk-ts-"
);

console.log();
console.log("Vendored:");
console.log(`  - ${forgeTgz}`);
console.log(`  - ${forgeTransformerSdkTgz}`);
console.log();

// --- Update file: specifiers ---
updateJson(CLI_PKG_JSON, (pkg) => {
	const devDeps = pkg.devDependencies as Record<string, string>;
	devDeps["@cloudflare/forge"] = `file:../../vendor/${forgeTgz}`;
	delete devDeps["@cloudflare/forge-sdk-ts"];
	devDeps["@cloudflare/forge-transformer-sdk-ts"] =
		`file:../../vendor/${forgeTransformerSdkTgz}`;
});

// --- Install + reformat ---
// The vendored tarballs keep their package versions and filenames, so pnpm's
// existing lockfile entries still contain the previous tarball integrities.
// Repair those entries before reinstalling the newly packed contents.
console.log("Reinstalling and refreshing vendored tarball integrities...");
run("pnpm", ["install", "--force", "--fix-lockfile"], REPO_ROOT);
console.log("Reformatting updated package.json files...");
run("pnpm", ["exec", "vp", "fmt", ROOT_PKG_JSON, CLI_PKG_JSON], REPO_ROOT);

console.log();
console.log("Done. Review with: git diff");
