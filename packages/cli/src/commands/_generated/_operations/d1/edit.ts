/** @generated from d1.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/database/${request.database_id}`,
	body: "json",
} as const;
