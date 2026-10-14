/** @generated from oauth-clients.rotate-secret */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/oauth_clients/${request.oauth_client_id}/rotate_secret`,
} as const;
