/** @generated from zero-trust-users-delete-user */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users/${request.user_id}`,
} as const;
