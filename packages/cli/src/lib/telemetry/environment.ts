import os from "node:os";

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
