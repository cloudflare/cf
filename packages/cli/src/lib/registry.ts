import { resolve } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";

export const CLOUDFLARE_REGISTRY_PATH = "CLOUDFLARE_REGISTRY_PATH";

/** Resolve the dev registry shared by cf and dev servers spawned by cf. */
export function getCloudflareRegistryPath(
	env: NodeJS.ProcessEnv = process.env
): string {
	const configured = env[CLOUDFLARE_REGISTRY_PATH];
	return configured === undefined || configured === ""
		? resolve(getCfConfigPath(), "registry")
		: resolve(configured);
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
