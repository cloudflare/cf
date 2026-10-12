/** @generated from zero-trust.access.users.failed-logins.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users/${request.user_id}/failed_logins`,
} as const;
