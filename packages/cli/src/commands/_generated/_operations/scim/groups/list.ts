/** @generated from scim.groups.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Groups`,
	query: ["startIndex", "count", "filter"],
} as const;
