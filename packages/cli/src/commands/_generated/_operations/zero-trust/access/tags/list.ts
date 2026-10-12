/** @generated from access-tags-list-tags */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/tags`,
	query: ["page", "per_page"],
} as const;
