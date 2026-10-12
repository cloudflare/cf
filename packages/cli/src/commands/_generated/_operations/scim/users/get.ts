/** @generated from scim-users-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Users/${request.user_id}`,
} as const;
