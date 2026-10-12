/** @generated from tags-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tags/resources`,
	query: ["type", "name", "id", "case_insensitive", "tag", "cursor"],
} as const;
