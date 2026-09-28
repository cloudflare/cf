import { spawn } from "node:child_process";
import {
	closeSync,
	mkdirSync,
	openSync,
	readFileSync,
	renameSync,
	statSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import gt from "semver/functions/gt.js";
import major from "semver/functions/major.js";
import prerelease from "semver/functions/prerelease.js";
import valid from "semver/functions/valid.js";
import { VERSION } from "../version.js";

const PACKAGE_NAME = "cf";
const NPM_REGISTRY_URL = "https://registry.npmjs.org";

export const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const UPDATE_CHECK_TIMEOUT_MS = 3000;
const UPDATE_CHECK_LOCK_STALE_MS = 5000;

type UpdateChannel = "latest";
type UpdateCacheChannel = "beta" | "latest";
type NpmVersionCheckResult =
	| { status: "up-to-date" }
	| { status: "update-available"; latest: string }
	| { status: "failed" };
type NpmVersionChecker = (
	name: string,
	version: string,
	channel: UpdateChannel
) => Promise<NpmVersionCheckResult>;

interface UpdateCache {
	lastAttemptedAt?: number;
	lastSuccessfulAt?: number;
	latestVersion?: string;
}

export interface UpdateNotice {
	latestVersion: string;
	isMajor: boolean;
}

interface UpdateCheckOptions {
	cachePath?: string;
	currentVersion?: string;
	now?: number;
	spawnWorker?: () => void;
}

interface RefreshOptions {
	cachePath?: string;
	check?: NpmVersionChecker;
	currentVersion?: string;
	fetch?: typeof globalThis.fetch;
	now?: number;
}

function updateCacheChannel(version: string): UpdateCacheChannel {
	return prerelease(version)?.includes("beta") ? "beta" : "latest";
}

function updateCachePath(currentVersion = VERSION): string {
	return join(
		getCfConfigPath(),
		"cache",
		`update-check-${updateCacheChannel(currentVersion)}.json`
	);
}

function readUpdateCache(path = updateCachePath()): UpdateCache {
	try {
		const value = JSON.parse(readFileSync(path, "utf8")) as unknown;
		if (value === null || typeof value !== "object" || Array.isArray(value)) {
			return {};
		}
		const cache = value as Record<string, unknown>;
		return {
			lastAttemptedAt:
				typeof cache.lastAttemptedAt === "number" &&
				Number.isFinite(cache.lastAttemptedAt)
					? cache.lastAttemptedAt
					: undefined,
			lastSuccessfulAt:
				typeof cache.lastSuccessfulAt === "number" &&
				Number.isFinite(cache.lastSuccessfulAt)
					? cache.lastSuccessfulAt
					: undefined,
			latestVersion:
				typeof cache.latestVersion === "string" && valid(cache.latestVersion)
					? cache.latestVersion
					: undefined,
		};
	} catch {
		return {};
	}
}

function writeUpdateCache(
	cache: UpdateCache,
	path = updateCachePath()
): boolean {
	const temporaryPath = `${path}.${process.pid}.tmp`;
	try {
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(temporaryPath, `${JSON.stringify(cache)}\n`, {
			encoding: "utf8",
			mode: 0o600,
		});
		renameSync(temporaryPath, path);
		return true;
	} catch {
		try {
			unlinkSync(temporaryPath);
		} catch {
			// The temporary cache file may not have been created.
		}
		return false;
	}
}

function withUpdateCacheLock<T>(
	path: string,
	now: number,
	task: () => T
): T | undefined {
	const lockPath = `${path}.lock`;
	let descriptor: number | undefined;
	try {
		mkdirSync(dirname(path), { recursive: true });
		try {
			descriptor = openSync(lockPath, "wx", 0o600);
		} catch {
			try {
				if (now - statSync(lockPath).mtimeMs <= UPDATE_CHECK_LOCK_STALE_MS) {
					return undefined;
				}
				unlinkSync(lockPath);
				descriptor = openSync(lockPath, "wx", 0o600);
			} catch {
				return undefined;
			}
		}
		return task();
	} catch {
		return undefined;
	} finally {
		if (descriptor !== undefined) {
			try {
				closeSync(descriptor);
				unlinkSync(lockPath);
			} catch {
				// A disposable cache lock must never affect the command.
			}
		}
	}
}

function noticeForVersion(
	currentVersion: string,
	cache: UpdateCache
): UpdateNotice | undefined {
	if (
		!valid(currentVersion) ||
		!cache.latestVersion ||
		!gt(cache.latestVersion, currentVersion)
	) {
		return undefined;
	}
	const latestMajor = major(cache.latestVersion);
	const isMajor = latestMajor > major(currentVersion);
	return {
		latestVersion: cache.latestVersion,
		isMajor,
	};
}

/**
 * Read the last registry result without doing network I/O. The notice remains
 * until cf is upgraded or the registry reports a different version.
 */
export function getUpdateNotice(
	currentVersion: string,
	cachePath = updateCachePath(currentVersion)
): UpdateNotice | undefined {
	const cache = readUpdateCache(cachePath);
	return noticeForVersion(currentVersion, cache);
}

function spawnUpdateCheckWorker(): void {
	const runningFromSource = import.meta.url.endsWith(".ts");
	const workerUrl = new URL(
		runningFromSource
			? "../update-check-worker.ts"
			: "./update-check-worker.mjs",
		import.meta.url
	);
	const workerArgs = runningFromSource
		? [...process.execArgv, fileURLToPath(workerUrl)]
		: [fileURLToPath(workerUrl)];
	const child = spawn(process.execPath, workerArgs, {
		detached: true,
		stdio: "ignore",
		windowsHide: true,
	});
	child.unref();
}

/**
 * Claim the daily refresh before detaching the worker. Writing the attempt
 * first ensures an offline registry cannot turn every cf command into a retry.
 */
export function maybeStartBackgroundUpdateCheck(
	options: UpdateCheckOptions = {}
): void {
	const cachePath =
		options.cachePath ?? updateCachePath(options.currentVersion ?? VERSION);
	const now = options.now ?? Date.now();
	const claimed = withUpdateCacheLock(cachePath, now, () => {
		const cache = readUpdateCache(cachePath);
		if (
			cache.lastAttemptedAt !== undefined &&
			now - cache.lastAttemptedAt < UPDATE_CHECK_INTERVAL_MS
		) {
			return false;
		}
		return writeUpdateCache({ ...cache, lastAttemptedAt: now }, cachePath);
	});
	if (!claimed) {
		return;
	}
	try {
		(options.spawnWorker ?? spawnUpdateCheckWorker)();
	} catch {
		// The timestamp remains claimed so spawn failures cannot cause retry spam.
	}
}

async function checkNpmVersion(
	name: string,
	version: string,
	channel: UpdateChannel,
	fetchImpl: typeof globalThis.fetch
): Promise<NpmVersionCheckResult> {
	if (!valid(version)) {
		return { status: "failed" };
	}
	const response = await fetchImpl(
		`${NPM_REGISTRY_URL}/${encodeURIComponent(name)}/${channel}`,
		{
			headers: {
				accept: "application/json",
				"user-agent": `cf-cli/${VERSION}`,
			},
			signal: AbortSignal.timeout(UPDATE_CHECK_TIMEOUT_MS),
		}
	);
	if (!response.ok) {
		return { status: "failed" };
	}
	const value = (await response.json()) as unknown;
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return { status: "failed" };
	}
	const result = value as Record<string, unknown>;
	if (
		result.name !== name ||
		typeof result.version !== "string" ||
		!valid(result.version)
	) {
		return { status: "failed" };
	}
	return gt(result.version, version)
		? { status: "update-available", latest: result.version }
		: { status: "up-to-date" };
}

/**
 * Run inside the detached worker, checking the latest dist-tag and persisting
 * the result for a later cf invocation.
 */
export async function refreshUpdateCache(
	options: RefreshOptions = {}
): Promise<void> {
	const currentVersion = options.currentVersion ?? VERSION;
	const cachePath = options.cachePath ?? updateCachePath(currentVersion);
	const now = options.now ?? Date.now();
	try {
		const check =
			options.check ??
			((name, version, tag) =>
				checkNpmVersion(name, version, tag, options.fetch ?? globalThis.fetch));
		const result = await check(PACKAGE_NAME, currentVersion, "latest");
		if (result.status === "failed") {
			return;
		}
		const latestVersion =
			result.status === "update-available" ? result.latest : currentVersion;
		if (!valid(latestVersion)) {
			return;
		}
		const cache = readUpdateCache(cachePath);
		writeUpdateCache(
			{
				...cache,
				latestVersion,
				lastSuccessfulAt: now,
			},
			cachePath
		);
	} catch {
		// Network, timeout, and cache errors are all deliberately invisible.
	}
}
