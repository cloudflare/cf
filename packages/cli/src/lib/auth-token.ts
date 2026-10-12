import { getAuthFromEnv } from "@cloudflare/workers-auth";
import { getValidToken as getOAuthToken } from "./oauth/index.js";

/**
 * Get the authentication token for the Cloudflare API.
 *
 * Resolution order:
 * 1. `CLOUDFLARE_API_TOKEN` environment variable (cf does not support the
 *    global API key + email pair, so `allowGlobalAuthKey` is `false`).
 * 2. cf's stored OAuth token (refreshed if expired).
 *
 * @throws Error if no authentication token is found.
 */
export async function getAuthToken(): Promise<string> {
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

	throw new Error(
		`No authentication token found.

Please set one of the following:
  1. Set the CLOUDFLARE_API_TOKEN environment variable
  2. Run 'cf auth login' to authenticate via OAuth

For API tokens, visit: https://dash.cloudflare.com/profile/api-tokens`
	);
}
