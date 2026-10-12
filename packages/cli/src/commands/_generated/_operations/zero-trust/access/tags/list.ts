/** @generated from zero-trust.access.tags.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/tags`,
	query: ["page", "per_page"],
} as const;
