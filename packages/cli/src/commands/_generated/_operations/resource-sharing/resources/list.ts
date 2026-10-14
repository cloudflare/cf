/** @generated from resource-sharing.resources.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/shares/${request.share_id}/resources`,
	query: ["status", "resource_type", "page", "per_page"],
} as const;
