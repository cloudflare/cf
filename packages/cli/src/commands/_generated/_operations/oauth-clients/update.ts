/** @generated from oauth-clients-update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/oauth_clients/${request.oauth_client_id}`,
	body: "json",
} as const;
