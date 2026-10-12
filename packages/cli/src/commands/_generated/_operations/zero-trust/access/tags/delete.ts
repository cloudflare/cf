/** @generated from access-tags-delete-a-tag */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/tags/${request.tag_name}`,
} as const;
