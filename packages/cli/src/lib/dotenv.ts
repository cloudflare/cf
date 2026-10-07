import { loadEnv } from "@cloudflare/workers-utils/local-env";

interface CloudflareDotEnvOptions {
	mode?: string;
	local?: boolean;
}

const CLOUDFLARE_DOTENV_VARIABLES = new Set([
	"CLOUDFLARE_ACCESS_CLIENT_ID",
	"CLOUDFLARE_ACCESS_CLIENT_SECRET",
	"CLOUDFLARE_ACCOUNT_ID",
	"CLOUDFLARE_API_TOKEN",
	"CLOUDFLARE_COMPLIANCE_REGION",
	"CLOUDFLARE_ZONE_ID",
	// TODO: Remove once cf has a CLOUDFLARE_ replacement for selecting the
	// API environment.
	"WRANGLER_API_ENVIRONMENT",
]);

function isSupportedCloudflareDotEnvVariable(name: string): boolean {
	return CLOUDFLARE_DOTENV_VARIABLES.has(name);
}

/**
 * Temporarily apply supported file-sourced values to process.env.
 *
 * Existing process values retain loadEnv's higher precedence. The returned
 * callback removes the file values added by this invocation.
 */
export async function applyCloudflareDotEnv(
	options: CloudflareDotEnvOptions = {}
): Promise<() => void> {
	if (options.local) {
		return () => {};
	}

	const loaded = await loadEnv(process.cwd(), options.mode);
	const applied: string[] = [];

	for (const [name, value] of Object.entries(loaded.values)) {
		if (
			!isSupportedCloudflareDotEnvVariable(name) ||
			loaded.sources[name]?.type !== "file"
		) {
			continue;
		}
		process.env[name] = value;
		applied.push(name);
	}

	return () => {
		for (const name of applied) {
			delete process.env[name];
		}
	};
}

/** Run a callback with Cloudflare dotenv values applied. */
export async function withCloudflareDotEnv<T>(
	options: CloudflareDotEnvOptions,
	callback: () => T | Promise<T>
): Promise<T> {
	const restore = await applyCloudflareDotEnv(options);
	try {
		return await callback();
	} finally {
		restore();
	}
}

// These commands either own dotenv loading, launch a child process that should
// not inherit the values, or apply them themselves after delegation.
const GLOBAL_DOTENV_EXCLUSIONS = new Set([
	"access curl",
	"access login",
	"access rdp",
	"access smb",
	"access ssh",
	"access ssh-config",
	"access ssh-gen",
	"access tcp",
	"access token",
	"ai claude",
	"ai codex",
	"ai opencode",
	"ai opencode run",
	"ai pi",
	"build",
	"dev",
	"init",
	"init workers",
	"migrate",
	"tunnels diag",
	"tunnels login",
	"tunnels quick-start",
	"tunnels ready",
	"tunnels tail",
	"workers check",
	"workers types",
	"deploy",
	"previews deploy",
	"tunnels run",
	"workers triggers deploy",
	"workers versions create",
]);

/** Whether cf may temporarily load local dotenv values for this command. */
export function shouldApplyCloudflareDotEnv(
	command: string,
	isLocal: boolean
): boolean {
	return !isLocal && !GLOBAL_DOTENV_EXCLUSIONS.has(command);
}
