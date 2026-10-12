/** @generated from zero-trust-users-get-failed-logins */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users/${request.user_id}/failed_logins`,
} as const;
