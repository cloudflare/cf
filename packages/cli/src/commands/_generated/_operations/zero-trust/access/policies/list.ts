/** @generated from zero-trust.access.policies.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policies`,
	query: ["page", "per_page"],
} as const;
