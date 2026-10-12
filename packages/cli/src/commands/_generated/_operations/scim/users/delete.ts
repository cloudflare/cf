/** @generated from scim-users-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Users/${request.user_id}`,
	response: false,
} as const;
