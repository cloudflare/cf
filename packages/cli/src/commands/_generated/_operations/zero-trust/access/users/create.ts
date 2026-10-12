/** @generated from zero-trust-users-create-user */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users`,
	body: "json",
} as const;
