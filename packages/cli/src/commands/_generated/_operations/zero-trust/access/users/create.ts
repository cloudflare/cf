/** @generated from zero-trust.access.users.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users`,
	body: "json",
} as const;
