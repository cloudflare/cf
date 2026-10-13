/** @generated from zero-trust.access.users.last-seen-identity.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users/${request.user_id}/last_seen_identity`,
} as const;
