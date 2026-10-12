/** @generated from oauth-clients-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/oauth_clients`,
	body: "json",
} as const;
