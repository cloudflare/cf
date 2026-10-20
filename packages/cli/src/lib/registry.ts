import { resolve } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";

export const CLOUDFLARE_REGISTRY_PATH = "CLOUDFLARE_REGISTRY_PATH";

/** Keep cf's default unless a registry path is explicitly configured. */
export function getCloudflareRegistryPath(
	env: NodeJS.ProcessEnv = process.env
): string {
	const configured =
		env[CLOUDFLARE_REGISTRY_PATH] ||
		env.WRANGLER_REGISTRY_PATH ||
		env.MINIFLARE_REGISTRY_PATH;
	return configured
		? resolve(configured)
		: resolve(getCfConfigPath(), "registry");
}

/** Environment variables understood by cf, Wrangler, and Miniflare peers. */
export function getCloudflareRegistryEnvironment(
	env: NodeJS.ProcessEnv = process.env
): Record<string, string> {
	const registryPath = getCloudflareRegistryPath(env);
	return {
		[CLOUDFLARE_REGISTRY_PATH]: registryPath,
		WRANGLER_REGISTRY_PATH: registryPath,
		MINIFLARE_REGISTRY_PATH: registryPath,
	};
}
