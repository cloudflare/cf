#!/usr/bin/env node
/**
 * Vendor the latest published @cloudflare/forge build of Forge's main branch
 * into vendor/.
 *
 * Forge's `Publish preview` workflow builds the package (the forge binary for
 * every platform plus @cloudflare/forge/plugin) from each commit on its main
 * branch and publishes it to GitHub Packages under the `main` dist-tag. That
 * registry needs a token even to read, so cf vendors the tarball rather than
 * making every install authenticate: this downloads it, checks it against the
 * registry's integrity hash, copies it into vendor/, points packages/cli at
 * it, and refreshes pnpm-lock.yaml.
 *
 * Usage:
 *   pnpm sync:forge
 *
 * The token needs `read:packages`. It is read from FORGE_PACKAGE_TOKEN, GH_TOKEN
 * or GITHUB_TOKEN, else from `gh auth token` (add the scope with
 * `gh auth refresh -s read:packages`).
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { x } from "tinyexec";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const VENDOR_DIR = join(REPO_ROOT, "vendor");
const CLI_PKG_JSON = join(REPO_ROOT, "packages/cli/package.json");
const PACKAGE_NAME = "@cloudflare/forge";
const REGISTRY_URL = "https://npm.pkg.github.com";
const REQUEST_TIMEOUT_MS = 120_000;
const VENDORED_SPEC_PATTERN =
	/^file:\.\.\/\.\.\/vendor\/cloudflare-forge-(.+)\.tgz$/;
// Restricts versions to semver characters, as the version names a file.
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

const DIST_TAG = "main";

export type ForgePackage = {
	version: string;
	tarball: string;
	integrity: string | undefined;
	shasum: string | undefined;
};

type CliPackageJson = { devDependencies: Record<string, string> };

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function registryFetch(url: string, token: string): Promise<Response> {
	// fetch drops the Authorization header when GitHub redirects a tarball
	// download to its storage host, so the token stays with the registry.
	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});
	if (!response.ok) {
		const hint =
			response.status === 401 || response.status === 403
				? "; the token needs read:packages and access to cloudflare/forge's packages"
				: "";
		throw new Error(
			`GET ${url} failed (${response.status} ${response.statusText})${hint}`
		);
	}
	return response;
}

/** Resolves the latest @cloudflare/forge build of Forge's main branch. */
export async function resolveForgePackage(
	token: string
): Promise<ForgePackage> {
	const url = `${REGISTRY_URL}/${PACKAGE_NAME.replace("/", "%2f")}`;
	const packument: unknown = await (await registryFetch(url, token)).json();
	if (
		!isObject(packument) ||
		packument.name !== PACKAGE_NAME ||
		!isObject(packument.versions)
	) {
		throw new Error(`${url} returned no ${PACKAGE_NAME} package metadata`);
	}
	const tags = isObject(packument["dist-tags"]) ? packument["dist-tags"] : {};
	const version = tags[DIST_TAG];
	if (typeof version !== "string") {
		throw new Error(
			`${PACKAGE_NAME} has no ${DIST_TAG} dist-tag (dist-tags: ${Object.keys(tags).join(", ") || "none"})`
		);
	}
	if (!VERSION_PATTERN.test(version)) {
		throw new Error(`${PACKAGE_NAME} has an unexpected version: ${version}`);
	}
	const manifest = packument.versions[version];
	if (!isObject(manifest) || !isObject(manifest.dist)) {
		throw new Error(`${PACKAGE_NAME}@${version} has no published manifest`);
	}
	const { tarball, integrity, shasum } = manifest.dist;
	if (typeof tarball !== "string") {
		throw new Error(`${PACKAGE_NAME}@${version} has no tarball URL`);
	}
	// The download sends the token, so a registry response must not be able
	// to point it at another origin.
	if (URL.parse(tarball)?.origin !== REGISTRY_URL) {
		throw new Error(
			`${PACKAGE_NAME}@${version} has a tarball outside ${REGISTRY_URL}: ${tarball}`
		);
	}
	if (typeof integrity !== "string" && typeof shasum !== "string") {
		throw new Error(`${PACKAGE_NAME}@${version} has no integrity hash`);
	}
	return {
		version,
		tarball,
		integrity: typeof integrity === "string" ? integrity : undefined,
		shasum: typeof shasum === "string" ? shasum : undefined,
	};
}

/** Throws unless `bytes` match the registry's hash for `pkg`. */
export function verifyForgeTarball(pkg: ForgePackage, bytes: Buffer): void {
	if (pkg.integrity !== undefined) {
		const [algorithm, expected] = pkg.integrity.split("-", 2);
		if (algorithm !== "sha512" || !expected) {
			throw new Error(`Unsupported integrity hash: ${pkg.integrity}`);
		}
		const actual = createHash("sha512").update(bytes).digest("base64");
		if (actual !== expected) {
			throw new Error(
				`${PACKAGE_NAME}@${pkg.version} failed its integrity check`
			);
		}
		return;
	}
	const actual = createHash("sha1").update(bytes).digest("hex");
	if (actual !== pkg.shasum) {
		throw new Error(`${PACKAGE_NAME}@${pkg.version} failed its shasum check`);
	}
}

function readCliPackageJson(): CliPackageJson {
	return JSON.parse(readFileSync(CLI_PKG_JSON, "utf8")) as CliPackageJson;
}

/** Returns the version of the vendored tarball packages/cli depends on. */
export function getVendoredForgeVersion(): string {
	const spec = readCliPackageJson().devDependencies[PACKAGE_NAME];
	const version = spec?.match(VENDORED_SPEC_PATTERN)?.[1];
	if (version === undefined) {
		throw new Error(
			`packages/cli does not depend on a vendored ${PACKAGE_NAME} tarball: ${spec}`
		);
	}
	return version;
}

/** Downloads `pkg` into vendor/ and points packages/cli at it. */
export async function vendorForgePackage(
	pkg: ForgePackage,
	token: string
): Promise<void> {
	console.log(`Downloading ${PACKAGE_NAME}@${pkg.version}`);
	const bytes = Buffer.from(
		await (await registryFetch(pkg.tarball, token)).arrayBuffer()
	);
	verifyForgeTarball(pkg, bytes);

	const name = `cloudflare-forge-${pkg.version}.tgz`;
	for (const old of readdirSync(VENDOR_DIR)) {
		if (old.startsWith("cloudflare-forge-") && old.endsWith(".tgz")) {
			rmSync(join(VENDOR_DIR, old));
		}
	}
	writeFileSync(join(VENDOR_DIR, name), bytes);
	console.log(`Wrote vendor/${name}`);

	const cliPackage = readCliPackageJson();
	cliPackage.devDependencies[PACKAGE_NAME] = `file:../../vendor/${name}`;
	writeFileSync(CLI_PKG_JSON, `${JSON.stringify(cliPackage, null, "\t")}\n`);

	// Refresh the lockfile's specifier and integrity, even where CI would
	// default to a frozen lockfile.
	await x("pnpm", ["install", "--no-frozen-lockfile"], {
		throwOnError: true,
		nodeOptions: { cwd: REPO_ROOT, stdio: "inherit" },
	});
}

async function findToken(): Promise<string> {
	const fromEnvironment =
		process.env.FORGE_PACKAGE_TOKEN ??
		process.env.GH_TOKEN ??
		process.env.GITHUB_TOKEN;
	if (fromEnvironment) {
		return fromEnvironment;
	}
	const result = await x("gh", ["auth", "token"], {
		nodeOptions: { stdio: ["ignore", "pipe", "ignore"] },
	});
	const token = result.exitCode === 0 ? result.stdout.trim() : "";
	if (!token) {
		throw new Error(
			"No GitHub token with read:packages: set FORGE_PACKAGE_TOKEN, or run gh auth login and gh auth refresh -s read:packages"
		);
	}
	return token;
}

async function main(): Promise<void> {
	if (process.argv.length > 2) {
		throw new Error("Usage: pnpm sync:forge");
	}
	const token = await findToken();
	const pkg = await resolveForgePackage(token);
	const current = getVendoredForgeVersion();
	if (pkg.version === current) {
		console.log(`Already vendoring ${PACKAGE_NAME}@${current}.`);
		return;
	}
	console.log(`Updating ${PACKAGE_NAME} from ${current} to ${pkg.version}.`);
	await vendorForgePackage(pkg, token);
}

if (
	process.argv[1] &&
	resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	main().catch((error: unknown) => {
		console.error(
			`ERROR: ${error instanceof Error ? error.message : String(error)}`
		);
		process.exitCode = 1;
	});
}
