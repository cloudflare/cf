/** @generated from access-tags-get-a-tag */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/tags/${request.tag_name}`,
} as const;
