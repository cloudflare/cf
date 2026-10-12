/** @generated from access-policies-list-access-reusable-policies */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/policies`,
	query: ["page", "per_page"],
} as const;
