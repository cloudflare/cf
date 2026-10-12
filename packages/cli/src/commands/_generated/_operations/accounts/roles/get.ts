/** @generated from accounts.roles.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/roles/${request.role_id}`,
} as const;
