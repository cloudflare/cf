/** @generated from accounts.tokens.permission-groups.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tokens/permission_groups`,
	query: ["name", "scope"],
} as const;
