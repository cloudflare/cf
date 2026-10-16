import os from "node:os";
import { DELEGATING_VERSION_ENV, DELEGATION_SENTINEL } from "../delegate.js";

// Plain semver with optional prerelease and build segments. Anything else,
// such as a path, an email address or a control character, is dropped
// rather than sent.
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
 * The version of the global cf that delegated this run to a project-local
 * cf, or undefined when the run was not delegated, the global cf predates
 * passing its version, or the value is not a plain semver string.
 */
export function getGlobalCliVersion(
	env: NodeJS.ProcessEnv = process.env
): string | undefined {
	if (!env[DELEGATION_SENTINEL]) {
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
