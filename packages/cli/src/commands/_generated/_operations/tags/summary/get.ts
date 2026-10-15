/** @generated from tags.summary.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tags/summary`,
	query: ["cursor"],
} as const;
