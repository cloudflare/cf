import { getAuthFromEnv } from "@cloudflare/workers-auth";
import { MissingCredentialsError } from "./errors.js";
import {
	activateTemporaryAccount,
	getValidToken as getOAuthToken,
	getTemporaryAccountApiToken,
	isOAuthLoggedIn,
	isTemporaryAccountAllowed,
} from "./oauth/index.js";

/**
 * Get the authentication token for the Cloudflare API.
 *
 * Resolution order:
 * 1. The temporary preview account requested with `--temporary-account`,
 *    provisioned or reused together with its account ID.
 * 2. `CLOUDFLARE_API_TOKEN` environment variable (cf does not support the
 *    global API key + email pair, so `allowGlobalAuthKey` is `false`).
 * 3. cf's stored OAuth token (refreshed if expired).
 *
 * @throws Error if no authentication token is found.
 */
export async function getAuthToken(): Promise<string> {
	if (isTemporaryAccountAllowed()) {
		await activateTemporaryAccount();
		const temporaryToken = getTemporaryAccountApiToken();
		if (!temporaryToken) {
			throw new Error("The temporary account has no API token.");
		}
		return temporaryToken;
	}

	// Environment credential (scoped API token only).
	const envAuth = getAuthFromEnv({ allowGlobalAuthKey: false });
	if (envAuth && "apiToken" in envAuth) {
		return envAuth.apiToken;
	}

	// cf's own OAuth token (refreshes if needed).
	const cfToken = await getOAuthToken();
	if (cfToken) {
		return cfToken;
	}

	const message = `No authentication token found.

Please set one of the following:
  1. Set the CLOUDFLARE_API_TOKEN environment variable
  2. Run 'cf auth login' to authenticate via OAuth

For API tokens, visit: https://dash.cloudflare.com/profile/api-tokens`;
	// A stored OAuth token that could not refresh still counts as existing
	// credentials, so a temporary account would be rejected.
	throw isOAuthLoggedIn()
		? new Error(message)
		: new MissingCredentialsError(message);
}
