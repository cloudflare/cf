/** @generated from access-tags-update-a-tag */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/tags/${request.tag_name}`,
	body: "json",
} as const;
