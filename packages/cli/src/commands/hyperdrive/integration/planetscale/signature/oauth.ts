import { getAuthFromEnv } from "@cloudflare/workers-auth";
import {
	DefaultScopeKeys,
	validateScopeKeys,
} from "@cloudflare/workers-auth/cf";
import { login, readAuthCredentials } from "#lib/auth.js";
import { isNonInteractiveOrCI } from "#lib/interactive.js";

const PLANETSCALE_SETUP_SCOPE = "hyperdrive-planetscale:setup";
const NO_BROWSER_ENV_VARS = [
	"CLOUDFLARE_ACCESS_CLIENT_SECRET",
	"WRANGLER_CF_AUTHORIZATION_TOKEN",
] as const;

export async function ensurePlanetScaleSetupScope(
	quiet = false
): Promise<void> {
	if (getAuthFromEnv({ allowGlobalAuthKey: false })) {
		return;
	}

	const storedScopes = readAuthCredentials()?.scopes;
	if (storedScopes?.includes(PLANETSCALE_SETUP_SCOPE)) {
		return;
	}
	if (isNonInteractiveOrCI()) {
		throw new Error(
			"Cloudflare-billed PlanetScale database creation requires additional Cloudflare authorization. " +
				"Run this command in an interactive terminal, or set CLOUDFLARE_API_TOKEN to an API token with the required permission."
		);
	}

	if (!quiet) {
		console.error(
			"Authorizing Cloudflare-billed PlanetScale database creation..."
		);
	}
	const reusableScopes: string[] = [];
	const staleScopes: string[] = [];
	for (const scope of storedScopes ?? []) {
		if (validateScopeKeys([scope])) {
			reusableScopes.push(scope);
		} else if (scope !== "offline_access") {
			staleScopes.push(scope);
		}
	}
	if (!quiet && staleScopes.length > 0) {
		console.error(
			`Ignoring OAuth scopes that are no longer requestable: ${staleScopes.join(", ")}`
		);
	}

	const scopes = [
		...new Set([
			...(reusableScopes.length > 0 ? reusableScopes : DefaultScopeKeys),
			PLANETSCALE_SETUP_SCOPE,
		]),
	];
	const loggedIn = await login({
		browser: !NO_BROWSER_ENV_VARS.some(
			(name) => process.env[name] !== undefined
		),
		scopes,
	});
	if (!loggedIn) {
		throw new Error(
			"CLOUDFLARE_API_TOKEN became active before OAuth authorization could start. " +
				"Use a token with the required permission or unset it and rerun this command."
		);
	}
	if (!readAuthCredentials()?.scopes?.includes(PLANETSCALE_SETUP_SCOPE)) {
		throw new Error(
			"Cloudflare-billed PlanetScale database creation authorization completed without granting the required OAuth scope: hyperdrive-planetscale:setup."
		);
	}
}
