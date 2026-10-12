/** @generated from zero-trust-users-get-last-seen-identity */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users/${request.user_id}/last_seen_identity`,
} as const;
