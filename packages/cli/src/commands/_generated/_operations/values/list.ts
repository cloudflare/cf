/** @generated from values.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tags/values/${request.tag_key}`,
	query: ["type", "cursor"],
} as const;
