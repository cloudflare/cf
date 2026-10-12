/** @generated from zero-trust-users-get-active-sessions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users/${request.user_id}/active_sessions`,
} as const;
