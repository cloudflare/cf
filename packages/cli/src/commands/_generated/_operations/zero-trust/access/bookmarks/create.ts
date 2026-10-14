/** @generated from zero-trust.access.bookmarks.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/bookmarks/${request.bookmark_id}`,
} as const;
