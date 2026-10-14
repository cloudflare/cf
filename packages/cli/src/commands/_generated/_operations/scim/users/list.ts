/** @generated from scim.users.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Users`,
	query: ["startIndex", "count", "filter"],
} as const;
