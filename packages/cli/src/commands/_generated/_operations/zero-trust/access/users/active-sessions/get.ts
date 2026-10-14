/** @generated from zero-trust.access.users.active-sessions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users/${request.user_id}/active_sessions/${request.nonce}`,
} as const;
