/** @generated from oauth-clients.delete-rotated-secret */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/oauth_clients/${request.oauth_client_id}/rotate_secret`,
} as const;
