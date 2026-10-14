/** @generated from accounts.logs.audit.history */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logs/audit/${request.id}/history`,
	query: ["action_time", "since", "before", "direction", "limit", "cursor"],
	errors: {
		404: "NotFoundError",
	},
} as const;
