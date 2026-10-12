/** @generated from zero-trust.access.users.active-sessions.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users/${request.user_id}/active_sessions`,
} as const;
