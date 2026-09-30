#!/usr/bin/env node
/* oxlint-disable turbo/no-undeclared-env-vars -- standalone release automation, not a turbo task */
import { execFileSync } from "node:child_process";
import {
	appendFileSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import semver from "semver";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const SOURCE_ROOT = resolve(process.argv[2] ?? "");
const RELEASE_FILE = ".github/workers-sdk-release.json";
const UPDATE_BRANCH = "automation/update-workers-sdk";
const DEPENDENCY_FIELDS = [
	"dependencies",
	"devDependencies",
	"optionalDependencies",
	"peerDependencies",
];
const WORKERS_SDK_PACKAGES = new Set([
	"@cloudflare/autoconfig",
	"@cloudflare/build-output-utils",
	"@cloudflare/cli-shared-helpers",
	"@cloudflare/codemods",
	"@cloudflare/config",
	"@cloudflare/containers-shared",
	"@cloudflare/deploy-helpers",
	"@cloudflare/runtime-types",
	"@cloudflare/workers-auth",
	"@cloudflare/workers-utils",
	"miniflare",
	"wrangler",
]);

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
	writeFileSync(path, `${JSON.stringify(value, null, "\t")}\n`);
}

function setSkip(reason) {
	console.log(reason);
	if (process.env.GITHUB_OUTPUT) {
		appendFileSync(process.env.GITHUB_OUTPUT, "skip=true\n");
	}
}

function getPublishedVersions() {
	const versions = new Map();
	for (const entry of readdirSync(join(SOURCE_ROOT, "packages"), {
		withFileTypes: true,
	})) {
		if (!entry.isDirectory()) {
			continue;
		}
		const path = join(SOURCE_ROOT, "packages", entry.name, "package.json");
		let manifest;
		try {
			manifest = readJson(path);
		} catch (error) {
			if (error?.code === "ENOENT") {
				continue;
			}
			throw error;
		}
		if (!WORKERS_SDK_PACKAGES.has(manifest.name)) {
			continue;
		}
		if (!semver.valid(manifest.version)) {
			throw new Error(`Invalid ${manifest.name} version: ${manifest.version}`);
		}
		versions.set(manifest.name, manifest.version);
	}
	const missing = [...WORKERS_SDK_PACKAGES].filter(
		(name) => !versions.has(name)
	);
	if (missing.length > 0) {
		throw new Error(`Missing workers-sdk packages: ${missing.join(", ")}`);
	}
	return versions;
}

async function getProposedVersions() {
	const repository = process.env.GITHUB_REPOSITORY;
	if (!repository) {
		return undefined;
	}
	const url = new URL(
		`https://api.github.com/repos/${repository}/contents/${RELEASE_FILE}`
	);
	url.searchParams.set("ref", UPDATE_BRANCH);
	const headers = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "cloudflare-cf-workers-sdk-updater",
	};
	const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	const response = await fetch(url, { headers });
	if (response.status === 404) {
		return undefined;
	}
	if (!response.ok) {
		throw new Error(
			`Cannot read ${UPDATE_BRANCH} release marker: HTTP ${response.status}`
		);
	}
	const result = await response.json();
	if (result.encoding !== "base64" || typeof result.content !== "string") {
		throw new Error(`Invalid ${UPDATE_BRANCH} release marker response`);
	}
	const marker = JSON.parse(Buffer.from(result.content, "base64").toString());
	if (typeof marker.versions !== "object" || marker.versions === null) {
		throw new Error(`Invalid ${UPDATE_BRANCH} release marker`);
	}
	return marker.versions;
}

function findManifests() {
	const manifests = [];
	for (const directory of ["packages", "fixtures"]) {
		for (const entry of readdirSync(join(ROOT, directory), {
			withFileTypes: true,
		})) {
			if (!entry.isDirectory()) {
				continue;
			}
			const path = join(ROOT, directory, entry.name, "package.json");
			let manifest;
			try {
				manifest = readJson(path);
			} catch (error) {
				if (error?.code === "ENOENT") {
					continue;
				}
				throw error;
			}
			manifests.push({ path, manifest });
		}
	}
	return manifests;
}

async function main() {
	const sha = process.env.WORKERS_SDK_SHA;
	if (!/^[0-9a-f]{40}$/.test(sha ?? "")) {
		throw new Error("WORKERS_SDK_SHA must be a 40-character commit SHA");
	}
	const checkedOutSha = execFileSync("git", ["rev-parse", "HEAD"], {
		cwd: SOURCE_ROOT,
		encoding: "utf8",
	}).trim();
	if (checkedOutSha !== sha) {
		throw new Error(
			`Expected workers-sdk ${sha}, checked out ${checkedOutSha}`
		);
	}

	const versions = getPublishedVersions();
	const proposed = await getProposedVersions();
	for (const [name, version] of versions) {
		const pendingVersion = proposed?.[name];
		if (pendingVersion !== undefined && !semver.valid(pendingVersion)) {
			throw new Error(`Invalid proposed ${name} version: ${pendingVersion}`);
		}
		if (pendingVersion && semver.lt(version, pendingVersion)) {
			setSkip(
				`Skipping older workers-sdk publish: ${name}@${version} < pending ${pendingVersion}`
			);
			return;
		}
	}

	const manifests = findManifests();
	const updates = new Map();
	for (const { manifest } of manifests) {
		for (const field of DEPENDENCY_FIELDS) {
			for (const [name, current] of Object.entries(manifest[field] ?? {})) {
				const version = versions.get(name);
				if (!version) {
					continue;
				}
				if (typeof current !== "string" || !semver.valid(current)) {
					throw new Error(
						`Expected an exact ${name} version, got ${String(current)}`
					);
				}
				if (semver.lt(version, current)) {
					setSkip(
						`Skipping older workers-sdk publish: ${name}@${version} < current ${current}`
					);
					return;
				}
				if (version !== current) {
					updates.set(name, `${current} -> ${version}`);
				}
			}
		}
	}

	if (updates.size === 0) {
		console.log("cf already uses the workers-sdk versions from this publish.");
		return;
	}
	for (const { path, manifest } of manifests) {
		let changed = false;
		for (const field of DEPENDENCY_FIELDS) {
			for (const name of Object.keys(manifest[field] ?? {})) {
				const version = versions.get(name);
				if (version && manifest[field][name] !== version) {
					manifest[field][name] = version;
					changed = true;
				}
			}
		}
		if (changed) {
			writeJson(path, manifest);
		}
	}
	writeJson(join(ROOT, RELEASE_FILE), {
		sha,
		versions: Object.fromEntries(
			[...versions].sort(([a], [b]) => a.localeCompare(b))
		),
	});
	writeFileSync(
		join(ROOT, ".changeset/update-workers-sdk.md"),
		`---\n"cf": patch\n---\n\nUpdate workers-sdk dependencies together from publish \`${sha.slice(0, 12)}\`.\n`
	);
	for (const [name, change] of updates) {
		console.log(`${name}: ${change}`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
