/** @generated from zero-trust.access.bookmarks.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/bookmarks/${request.bookmark_id}`,
} as const;
