/** @generated from tags-list-keys */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tags/keys`,
	query: ["cursor"],
} as const;
