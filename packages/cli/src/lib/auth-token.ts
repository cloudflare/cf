import { getAuthFromEnv } from "@cloudflare/workers-auth";
import { MissingCredentialsError } from "./errors.js";
import {
	getValidToken as getOAuthToken,
	isOAuthLoggedIn,
	isTemporaryAccountRequested,
	requireTemporaryAccount,
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
export async function getAuthToken(
	options?: Parameters<typeof requireTemporaryAccount>[0]
): Promise<string> {
	if (isTemporaryAccountRequested()) {
		return (await requireTemporaryAccount(options)).apiToken;
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
	if (isOAuthLoggedIn()) {
		throw new Error(
			"Could not refresh your stored OAuth token. Check your connection and retry, or run 'cf auth login' to authenticate again."
		);
	}

	throw new MissingCredentialsError(`No authentication token found.

Please set one of the following:
  1. Set the CLOUDFLARE_API_TOKEN environment variable
  2. Run 'cf auth login' to authenticate via OAuth

For API tokens, visit: https://dash.cloudflare.com/profile/api-tokens`);
}
