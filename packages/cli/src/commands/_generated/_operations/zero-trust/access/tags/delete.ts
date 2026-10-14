/** @generated from zero-trust.access.tags.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/tags/${request.tag_name}`,
} as const;
