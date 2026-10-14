/** @generated from zero-trust.access.bookmarks.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/bookmarks/${request.bookmark_id}`,
} as const;
