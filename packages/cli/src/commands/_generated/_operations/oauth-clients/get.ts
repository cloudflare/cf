/** @generated from oauth-clients-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/oauth_clients/${request.oauth_client_id}`,
} as const;
