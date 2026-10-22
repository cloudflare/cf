import os from "node:os";
import {
	DELEGATING_PID_ENV,
	DELEGATING_VERSION_ENV,
	DELEGATION_SENTINEL,
} from "../delegate.js";

// A semver-shaped string with optional prerelease and build segments. It is
// a loose bound, not a strict semver check. Anything else, such as a path,
// an email address or a control character, is dropped rather than sent.
const SEMVER_PATTERN =
	/^\d{1,5}\.\d{1,5}\.\d{1,5}(?:-[0-9A-Za-z.-]{1,40})?(?:\+[0-9A-Za-z.-]{1,40})?$/;
const MAX_VERSION_LENGTH = 64;

export function getPlatform(): string {
	switch (process.platform) {
		case "win32":
			return "Windows";
		case "darwin":
			return "Mac OS";
		case "linux":
			return "Linux";
		default:
			return `Others: ${process.platform}`;
	}
}

export function getOSVersion(): string {
	return os.version();
}

export function getArch(): string {
	return process.arch;
}

export function getNodeVersion(): number {
	return Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
}

export function getPackageManager():
	| "npm"
	| "pnpm"
	| "yarn"
	| "bun"
	| "unknown" {
	const userAgent = process.env.npm_config_user_agent ?? "";
	if (userAgent.startsWith("pnpm")) {
		return "pnpm";
	}
	if (userAgent.startsWith("yarn")) {
		return "yarn";
	}
	if (userAgent.startsWith("bun")) {
		return "bun";
	}
	if (userAgent.startsWith("npm")) {
		return "npm";
	}
	return "unknown";
}

/**
 * Whether a global cf handed this run directly to this process. The
 * sentinel is inherited by every process a delegated child spawns, so a
 * global cf that passes its process ID is trusted only when that is this
 * process's parent. A global cf released before the ID was passed sets the
 * sentinel alone, which is still reported as delegated.
 */
export function isDirectlyDelegated(
	env: NodeJS.ProcessEnv = process.env,
	parentPid: number = process.ppid
): boolean {
	if (!env[DELEGATION_SENTINEL]) {
		return false;
	}
	const delegatingPid = env[DELEGATING_PID_ENV];
	return delegatingPid === undefined || delegatingPid === String(parentPid);
}

/**
 * The version of the global cf that delegated this run to a project-local
 * cf, or undefined when the run was not delegated to this process
 * directly, the global cf predates passing its version and process ID, or
 * the value is not a semver-shaped string.
 */
export function getGlobalCliVersion(
	env: NodeJS.ProcessEnv = process.env,
	parentPid: number = process.ppid
): string | undefined {
	if (!env[DELEGATING_PID_ENV] || !isDirectlyDelegated(env, parentPid)) {
		return undefined;
	}
	const value = env[DELEGATING_VERSION_ENV];
	if (
		typeof value !== "string" ||
		value.length > MAX_VERSION_LENGTH ||
		!SEMVER_PATTERN.test(value)
	) {
		return undefined;
	}
	return value;
}
