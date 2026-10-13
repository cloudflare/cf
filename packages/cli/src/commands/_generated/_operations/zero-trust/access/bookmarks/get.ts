/** @generated from zero-trust.access.bookmarks.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/bookmarks/${request.bookmark_id}`,
} as const;
